import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDomainInput,
  BulkCreateDomainInput,
  UpdateDomainInput,
  ReorderDomainsInput,
  DomainType,
} from '@finallinks/contracts';
import {
  DomainType as PrismaDomainType,
  DomainStatus as PrismaDomainStatus,
  RoleType,
} from '@prisma/client';

export interface UserContext {
  id: string;
  role: {
    type: RoleType;
  };
}

@Injectable()
export class DomainsService {
  constructor(private readonly prisma: PrismaService) {}

  normalizeHostname(urlStr: string): string {
    try {
      const cleanUrl = urlStr.trim();
      const withProto =
        cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')
          ? cleanUrl
          : `https://${cleanUrl}`;
      const parsed = new URL(withProto);
      return parsed.hostname.toLowerCase();
    } catch {
      throw new BadRequestException(`Invalid domain or URL format: "${urlStr}"`);
    }
  }

  ensureFullUrl(urlStr: string): string {
    const cleanUrl = urlStr.trim();
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    return `https://${cleanUrl}`;
  }

  async verifyWebsiteOwnership(websiteId: string, user: UserContext) {
    const website = await this.prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website || website.deletedAt) {
      throw new NotFoundException(`Website with ID "${websiteId}" not found`);
    }

    if (user.role.type === RoleType.WEBSITE_OWNER && website.ownerId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to manage domains for this website.',
      );
    }

    return website;
  }

  // ---------------------------------------------------------------------------
  // Public Methods
  // ---------------------------------------------------------------------------

  async trackClick(id: string) {
    const domain = await this.prisma.domain.findUnique({ where: { id } });
    if (!domain) {
      throw new NotFoundException(`Domain with ID "${id}" not found`);
    }

    await this.prisma.domain.update({
      where: { id },
      data: { clickCount: { increment: 1 } },
    });

    if (domain.websiteId) {
      await this.prisma.website.update({
        where: { id: domain.websiteId },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {});
    }

    return { success: true, url: domain.url };
  }

  // ---------------------------------------------------------------------------
  // Owner & Admin Methods
  // ---------------------------------------------------------------------------

  async getOwnerWebsite(userId: string) {
    const website = await this.prisma.website.findUnique({
      where: { ownerId: userId },
    });
    if (!website || website.deletedAt) {
      throw new NotFoundException(
        'You do not have an active website associated with this account.',
      );
    }
    return website;
  }

  async getMyDomains(user: UserContext) {
    const website = await this.getOwnerWebsite(user.id);
    return this.findAllByWebsite(website.id, user);
  }

  async createForMyWebsite(input: CreateDomainInput, user: UserContext) {
    const website = await this.getOwnerWebsite(user.id);
    return this.create(website.id, input, user);
  }

  async createBulkForMyWebsite(input: BulkCreateDomainInput, user: UserContext) {
    const website = await this.getOwnerWebsite(user.id);
    return this.createBulk(website.id, input, user);
  }

  async reorderForMyWebsite(input: ReorderDomainsInput, user: UserContext) {
    const website = await this.getOwnerWebsite(user.id);
    return this.reorder(website.id, input, user);
  }

  async findAllByWebsite(websiteId: string, user: UserContext) {
    await this.verifyWebsiteOwnership(websiteId, user);

    return this.prisma.domain.findMany({
      where: { websiteId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(websiteId: string, input: CreateDomainInput, user: UserContext) {
    await this.verifyWebsiteOwnership(websiteId, user);

    const fullUrl = this.ensureFullUrl(input.url);
    const hostname = this.normalizeHostname(input.url);

    // Enforce Global Hostname Uniqueness (DEC-0004)
    const existing = await this.prisma.domain.findUnique({
      where: { hostname },
      include: { website: true },
    });

    if (existing) {
      throw new ConflictException(
        `Hostname "${hostname}" is already in use by website "${existing.website.name}".`,
      );
    }

    return this.prisma.domain.create({
      data: {
        websiteId,
        hostname,
        url: fullUrl,
        label: input.label || 'Mirror',
        type: (input.type || DomainType.MIRROR) as PrismaDomainType,
        status: PrismaDomainStatus.ACTIVE,
        isPublic: input.isPublic ?? true,
        sortOrder: input.sortOrder ?? 0,
        addedById: user.id,
      },
    });
  }

  async createBulk(websiteId: string, input: BulkCreateDomainInput, user: UserContext) {
    await this.verifyWebsiteOwnership(websiteId, user);

    const addedDomains: Array<Record<string, unknown>> = [];
    const skippedReasons: Array<{ line: string; reason: string }> = [];

    const itemsToProcess: Array<{
      url: string;
      label?: string;
      type?: DomainType;
      isPublic?: boolean;
      sortOrder?: number;
    }> = [];

    if (input.domains && Array.isArray(input.domains)) {
      itemsToProcess.push(...input.domains);
    } else if (input.rawLines) {
      const lines = input.rawLines.split(/[\r\n]+/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const parts = trimmed.split(',').map((p) => p.trim());
        const url = parts[0]!;
        const label = parts[1] || 'Mirror';
        const type = (parts[2] as DomainType) || input.defaultType || DomainType.MIRROR;
        itemsToProcess.push({
          url,
          label,
          type,
          isPublic: input.isPublic ?? true,
        });
      }
    }

    // Parse each entry in the items array
    for (const item of itemsToProcess) {
      try {
        const fullUrl = this.ensureFullUrl(item.url);
        const hostname = this.normalizeHostname(item.url);

        // Check duplicate within the same batch first
        const batchDuplicate = addedDomains.some((d) => d['hostname'] === hostname);
        if (batchDuplicate) {
          skippedReasons.push({
            line: item.url,
            reason: `Duplicate hostname "${hostname}" in current batch.`,
          });
          continue;
        }

        // Check if hostname already exists globally in the database
        const existing = await this.prisma.domain.findUnique({
          where: { hostname },
        });

        if (existing) {
          skippedReasons.push({
            line: item.url,
            reason: `Hostname "${hostname}" is already registered.`,
          });
          continue;
        }

        const domain = await this.prisma.domain.create({
          data: {
            websiteId,
            hostname,
            url: fullUrl,
            label: item.label || 'Mirror',
            type: (item.type || DomainType.MIRROR) as PrismaDomainType,
            status: PrismaDomainStatus.ACTIVE,
            isPublic: item.isPublic ?? true,
            sortOrder: item.sortOrder ?? 0,
            addedById: user.id,
          },
        });

        addedDomains.push(domain);
      } catch (err: unknown) {
        skippedReasons.push({
          line: item.url,
          reason: err instanceof Error ? err.message : 'Invalid domain format',
        });
      }
    }

    return {
      totalSubmitted: itemsToProcess.length,
      addedCount: addedDomains.length,
      skippedCount: skippedReasons.length,
      skippedReasons,
      addedDomains,
    };
  }

  async update(id: string, input: UpdateDomainInput, user: UserContext) {
    const domain = await this.prisma.domain.findUnique({
      where: { id },
      include: { website: true },
    });

    if (!domain) {
      throw new NotFoundException(`Domain with ID "${id}" not found`);
    }

    await this.verifyWebsiteOwnership(domain.websiteId, user);

    let updatedHostname: string | undefined;
    let updatedUrl: string | undefined;

    if (input.url) {
      updatedUrl = this.ensureFullUrl(input.url);
      updatedHostname = this.normalizeHostname(input.url);

      if (updatedHostname !== domain.hostname) {
        const existing = await this.prisma.domain.findUnique({
          where: { hostname: updatedHostname },
        });
        if (existing) {
          throw new ConflictException(
            `Hostname "${updatedHostname}" is already in use by another website.`,
          );
        }
      }
    }

    return this.prisma.domain.update({
      where: { id },
      data: {
        ...(updatedUrl ? { url: updatedUrl } : {}),
        ...(updatedHostname ? { hostname: updatedHostname } : {}),
        ...(input.label ? { label: input.label } : {}),
        ...(input.type ? { type: input.type as PrismaDomainType } : {}),
        ...(input.status ? { status: input.status as PrismaDomainStatus } : {}),
        ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
    });
  }

  async reorder(websiteId: string, input: ReorderDomainsInput, user: UserContext) {
    await this.verifyWebsiteOwnership(websiteId, user);

    await this.prisma.$transaction(
      input.items.map((item) =>
        this.prisma.domain.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return { message: 'Domains reordered successfully' };
  }

  async delete(id: string, user: UserContext) {
    const domain = await this.prisma.domain.findUnique({
      where: { id },
      include: { website: true },
    });

    if (!domain) {
      throw new NotFoundException(`Domain with ID "${id}" not found`);
    }

    await this.verifyWebsiteOwnership(domain.websiteId, user);

    await this.prisma.domain.delete({ where: { id } });
    return { message: `Domain "${domain.hostname}" deleted successfully` };
  }
}
