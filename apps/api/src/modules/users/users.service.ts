import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UserStatus,
  RoleType,
  WebsiteStatus,
  ContentRating,
  DomainType,
  DomainStatus,
} from '@prisma/client';
import { MailService } from '../mail/mail.service';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

export interface CreateOwnerUserInput {
  name: string;
  email: string;
  websiteName?: string;
  websiteUrl?: string;
  categoryId?: string;
  tagline?: string;
  description?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeHostname(urlStr: string): string {
  try {
    const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    return url.hostname.toLowerCase();
  } catch {
    return (urlStr.replace(/^https?:\/\//, '').split('/')[0] || '').toLowerCase();
  }
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              { name: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          role: true,
          website: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        avatarUrl: u.avatarUrl,
        status: u.status,
        role: u.role,
        website: u.website,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
        website: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      status: user.status,
      role: {
        id: user.role.id,
        name: user.role.name,
        type: user.role.type,
        permissions: user.role.permissions.map((rp) => rp.permission.key),
      },
      website: user.website,
      createdAt: user.createdAt,
    };
  }

  async setStatus(id: string, status: UserStatus) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, status: true },
    });
  }

  async createOwnerUser(data: CreateOwnerUserInput) {
    const email = data.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('A user with this email address already exists.');
    }

    // Find or ensure Website Owner role
    let ownerRole = await this.prisma.role.findFirst({
      where: { type: RoleType.WEBSITE_OWNER },
    });
    if (!ownerRole) {
      ownerRole = await this.prisma.role.create({
        data: {
          name: 'Website Owner',
          description: 'Approved website owner managing their website and domains',
          type: RoleType.WEBSITE_OWNER,
          isSystem: true,
        },
      });
    }

    // Generate secure temporary password
    const tempPassword = `Owner-${randomBytes(4).toString('hex').toUpperCase()}!9`;
    const passwordHash = await argon2.hash(tempPassword);

    const user = await this.prisma.user.create({
      data: {
        email,
        name: data.name.trim(),
        passwordHash,
        status: UserStatus.ACTIVE,
        mustChangePassword: true,
        roleId: ownerRole.id,
      },
      include: {
        role: true,
      },
    });

    let createdWebsite = null;
    let createdDomain = null;

    // If website name provided, automatically provision the website & domain
    if (data.websiteName && data.websiteName.trim()) {
      const siteName = data.websiteName.trim();
      let baseSlug = slugify(siteName) || 'website';
      let slug = baseSlug;
      let counter = 1;
      while (await this.prisma.website.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
      }

      // Determine category
      let categoryId = data.categoryId;
      if (!categoryId) {
        const defaultCat = await this.prisma.category.findFirst({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        });
        if (defaultCat) {
          categoryId = defaultCat.id;
        }
      }

      if (categoryId) {
        createdWebsite = await this.prisma.website.create({
          data: {
            ownerId: user.id,
            name: siteName,
            slug,
            tagline: data.tagline?.trim() || null,
            description:
              data.description?.trim() ||
              `Official directory listing and mirror routing for ${siteName}.`,
            categoryId,
            status: WebsiteStatus.ACTIVE,
            contentRating: ContentRating.ALL,
          },
        });

        if (data.websiteUrl && data.websiteUrl.trim()) {
          const rawUrl = data.websiteUrl.trim();
          const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
          const hostname = normalizeHostname(url);

          // Check if hostname already exists
          const existingDomain = await this.prisma.domain.findUnique({ where: { hostname } });
          if (!existingDomain) {
            createdDomain = await this.prisma.domain.create({
              data: {
                websiteId: createdWebsite.id,
                hostname,
                url,
                type: DomainType.PRIMARY,
                status: DomainStatus.ACTIVE,
                isPublic: true,
                sortOrder: 0,
              },
            });
          }
        }
      }
    }

    // Dispatch email with credentials
    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3002';
    await this.mailService.sendRegistrationApprovedWithCredentialsEmail({
      to: user.email,
      applicantName: user.name,
      websiteName: createdWebsite ? createdWebsite.name : 'FinalLinks Network',
      tempPassword,
      loginUrl: `${adminUrl}/login`,
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      website: createdWebsite,
      domain: createdDomain,
      tempPassword,
    };
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, website: true },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    if (user.role?.type === RoleType.SUPER_ADMIN) {
      throw new BadRequestException('Security restriction: Cannot delete the Super Admin account.');
    }

    // If user has a website, soft-delete the website as well
    if (user.website) {
      await this.prisma.website.update({
        where: { id: user.website.id },
        data: {
          deletedAt: new Date(),
          status: WebsiteStatus.ARCHIVED,
        },
      });
    }

    // Soft delete the user
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: UserStatus.SUSPENDED },
      select: { id: true, email: true, deletedAt: true },
    });
  }
}
