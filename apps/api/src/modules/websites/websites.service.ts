import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WebsiteFilterParams, UpdateWebsiteInput, WebsiteStatus } from '@finallinks/contracts';
import {
  WebsiteStatus as PrismaWebsiteStatus,
  Prisma,
  RoleType,
  UserStatus,
  ContentRating,
  DomainType,
  DomainStatus,
} from '@prisma/client';
import { MailService } from '../mail/mail.service';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

export interface CreateWebsiteAdminInput {
  name: string;
  primaryUrl: string;
  categoryId: string;
  tagline?: string;
  description?: string;
  contentRating?: 'ALL' | 'MATURE';
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  createdByAdmin?: boolean;
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
export class WebsitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  // ---------------------------------------------------------------------------
  // Public Methods
  // ---------------------------------------------------------------------------

  async findAllPublic(params: WebsiteFilterParams) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.WebsiteWhereInput = {
      status: PrismaWebsiteStatus.ACTIVE,
      deletedAt: null,
    };

    if (params.search && params.search.trim().length > 0) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { tagline: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (params.categorySlug) {
      where.category = { slug: params.categorySlug.toLowerCase() };
    }

    if (params.tagSlug) {
      where.tags = {
        some: {
          tag: { slug: params.tagSlug.toLowerCase() },
        },
      };
    }

    let orderBy: Prisma.WebsiteOrderByWithRelationInput[] = [{ isFeatured: 'desc' }];
    switch (params.sortBy) {
      case 'popular':
        orderBy.push({ viewCount: 'desc' });
        break;
      case 'newest':
        orderBy.push({ createdAt: 'desc' });
        break;
      case 'alphabetical':
        orderBy.push({ name: 'asc' });
        break;
      default:
        orderBy.push({ viewCount: 'desc' }, { name: 'asc' });
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.website.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true } },
          tags: { include: { tag: true } },
          domains: {
            where: { isPublic: true },
            orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
          },
        },
      }),
      this.prisma.website.count({ where }),
    ]);

    return {
      items: items.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        tagline: w.tagline,
        description: w.description,
        logoUrl: w.logoUrl,
        coverUrl: w.coverUrl,
        contentRating: w.contentRating,
        isFeatured: w.isFeatured,
        viewCount: w.viewCount,
        stars: w.stars,
        sortOrder: w.sortOrder,
        category: w.category,
        tags: w.tags.map((t) => t.tag),
        domains: w.domains,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findGroupedByCategory() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        websites: {
          where: {
            status: PrismaWebsiteStatus.ACTIVE,
            deletedAt: null,
          },
          orderBy: [
            { sortOrder: 'asc' },
            { isFeatured: 'desc' },
            { stars: 'desc' },
            { viewCount: 'desc' },
            { name: 'asc' },
          ],
          include: {
            tags: { include: { tag: true } },
            domains: {
              where: { isPublic: true },
              orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
            },
          },
        },
      },
    });

    return categories.map((cat) => ({
      category: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
      },
      websites: cat.websites.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        tagline: w.tagline,
        description: w.description,
        logoUrl: w.logoUrl,
        coverUrl: w.coverUrl,
        contentRating: w.contentRating,
        isFeatured: w.isFeatured,
        viewCount: w.viewCount,
        stars: w.stars,
        sortOrder: w.sortOrder,
        tags: w.tags.map((t) => t.tag),
        domains: w.domains,
      })),
    }));
  }

  async findBySlugPublic(slug: string) {
    const website = await this.prisma.website.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        category: true,
        tags: { include: { tag: true } },
        domains: {
          where: { isPublic: true },
          orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
        },
      },
    });

    if (!website || website.status !== PrismaWebsiteStatus.ACTIVE || website.deletedAt) {
      throw new NotFoundException(`Website "${slug}" not found`);
    }

    // Increment viewCount asynchronously
    this.prisma.website
      .update({
        where: { id: website.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    return {
      id: website.id,
      name: website.name,
      slug: website.slug,
      tagline: website.tagline,
      description: website.description,
      logoUrl: website.logoUrl,
      coverUrl: website.coverUrl,
      language: website.language,
      contentRating: website.contentRating,
      isFeatured: website.isFeatured,
      seoTitle: website.seoTitle,
      seoDescription: website.seoDescription,
      socialLinks: website.socialLinks,
      viewCount: website.viewCount + 1,
      stars: Math.max(website.stars || 0, website.starCount || 0),
      starCount: Math.max(website.stars || 0, website.starCount || 0),
      category: website.category,
      tags: website.tags.map((t) => t.tag),
      domains: website.domains,
      createdAt: website.createdAt,
      updatedAt: website.updatedAt,
    };
  }

  async getPreviewBySlug(slug: string) {
    const normalizedSlug = slug.toLowerCase();
    let website = await this.prisma.website.findUnique({
      where: { slug: normalizedSlug },
      include: {
        category: true,
        tags: { include: { tag: true } },
        domains: {
          where: { isPublic: true },
          orderBy: [{ sortOrder: 'asc' }],
        },
      },
    });

    if (!website) {
      // Check SlugRedirect
      const redirect = await this.prisma.slugRedirect.findUnique({
        where: { oldSlug: normalizedSlug },
        include: {
          website: {
            include: {
              category: true,
              tags: { include: { tag: true } },
              domains: {
                where: { isPublic: true },
                orderBy: [{ sortOrder: 'asc' }],
              },
            },
          },
        },
      });
      if (redirect?.website) {
        website = redirect.website;
      }
    }

    if (!website || website.status !== PrismaWebsiteStatus.ACTIVE || website.deletedAt) {
      throw new NotFoundException(`Website "${slug}" not found`);
    }

    // Rank in category: count active websites in same category with lower sortOrder
    const rankInCategory =
      (await this.prisma.website.count({
        where: {
          categoryId: website.categoryId,
          status: PrismaWebsiteStatus.ACTIVE,
          deletedAt: null,
          OR: [
            { sortOrder: { lt: website.sortOrder } },
            { AND: [{ sortOrder: website.sortOrder }, { name: { lt: website.name } }] },
          ],
        },
      })) + 1;

    const isNew = Date.now() - new Date(website.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;

    const activeDomains = website.domains.filter((d) => d.status === DomainStatus.ACTIVE);
    let fastestMirror: { url: string; ms: number | null } | null = null;
    if (activeDomains.length > 0) {
      const withLatency = activeDomains
        .filter((d) => d.lastResponseMs != null && (d.lastResponseMs as number) > 0)
        .sort(
          (a, b) => ((a.lastResponseMs as number) ?? 9999) - ((b.lastResponseMs as number) ?? 9999),
        );
      const chosen =
        withLatency[0] ||
        activeDomains.find((d) => d.type === DomainType.PRIMARY) ||
        activeDomains[0];
      if (chosen) {
        fastestMirror = { url: chosen.url, ms: chosen.lastResponseMs };
      }
    }

    // Top 8 mirrors: Primary first, then by sortOrder
    const sortedMirrors = [...website.domains].sort((a, b) => {
      if (a.type === DomainType.PRIMARY && b.type !== DomainType.PRIMARY) return -1;
      if (b.type === DomainType.PRIMARY && a.type !== DomainType.PRIMARY) return 1;
      return a.sortOrder - b.sortOrder;
    });

    const mirrors = sortedMirrors.slice(0, 8).map((d) => ({
      id: d.id,
      label: d.label || d.hostname,
      url: d.url,
      type: d.type,
      status: d.status,
      responseMs: d.lastResponseMs,
    }));

    const lastVerified = website.domains.reduce<Date | null>((latest, d) => {
      if (!d.lastCheckedAt) return latest;
      if (!latest || d.lastCheckedAt > latest) return d.lastCheckedAt;
      return latest;
    }, null);

    return {
      id: website.id,
      slug: website.slug,
      name: website.name,
      faviconUrl: website.logoUrl,
      shortDescription: website.shortDescription || website.tagline,
      highlights: (website.highlights || []).slice(0, 6),
      note: website.note,
      category: {
        id: website.category.id,
        slug: website.category.slug,
        name: website.category.name,
        accentKey: website.category.slug,
      },
      rankInCategory,
      starCount: website.starCount ?? website.stars ?? 0,
      domainsCount: website.domains.length,
      onlineCount: activeDomains.length,
      fastestMirror,
      mirrors,
      lastVerifiedAt: lastVerified ? lastVerified.toISOString() : website.updatedAt.toISOString(),
      tags: website.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, slug: t.tag.slug })),
      isNew,
    };
  }

  async getDetailBySlug(slug: string) {
    const preview = await this.getPreviewBySlug(slug);

    const full = await this.prisma.website.findUnique({
      where: { id: preview.id },
      include: {
        screenshots: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    // Related websites from same category (up to 6, excluding current)
    const relatedWebsites = await this.prisma.website.findMany({
      where: {
        categoryId: preview.category.id,
        id: { not: preview.id },
        status: PrismaWebsiteStatus.ACTIVE,
        deletedAt: null,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        domains: {
          where: { isPublic: true },
          orderBy: [{ sortOrder: 'asc' }],
        },
      },
      take: 6,
      orderBy: { sortOrder: 'asc' },
    });

    const related = relatedWebsites.map((w, idx) => {
      const active = w.domains.filter((d) => d.status === DomainStatus.ACTIVE);
      const sorted = [...w.domains].sort((a, b) => {
        if (a.type === DomainType.PRIMARY && b.type !== DomainType.PRIMARY) return -1;
        if (b.type === DomainType.PRIMARY && a.type !== DomainType.PRIMARY) return 1;
        return a.sortOrder - b.sortOrder;
      });
      return {
        id: w.id,
        slug: w.slug,
        name: w.name,
        faviconUrl: w.logoUrl,
        shortDescription: w.shortDescription || w.tagline,
        highlights: (w.highlights || []).slice(0, 6),
        note: w.note,
        category: {
          id: w.category.id,
          slug: w.category.slug,
          name: w.category.name,
          accentKey: w.category.slug,
        },
        rankInCategory: idx + 1,
        starCount: w.starCount ?? w.stars ?? 0,
        domainsCount: w.domains.length,
        onlineCount: active.length,
        fastestMirror: null,
        mirrors: sorted.slice(0, 4).map((d) => ({
          id: d.id,
          label: d.label || d.hostname,
          url: d.url,
          type: d.type,
          status: d.status,
          responseMs: d.lastResponseMs,
        })),
        lastVerifiedAt: w.updatedAt.toISOString(),
        tags: w.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, slug: t.tag.slug })),
        isNew: Date.now() - new Date(w.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000,
      };
    });

    return {
      ...preview,
      description: full?.description || '',
      allHighlights: full?.highlights || preview.highlights,
      screenshots: (full?.screenshots || []).map((s) => ({
        id: s.id,
        url: s.url,
        thumbnailUrl: s.thumbnailUrl,
        altText: s.altText,
        sortOrder: s.sortOrder,
      })),
      stats: {
        clicks30d: full?.viewCount || 0,
        uptime30d: 99.8,
        addedAt: full?.createdAt.toISOString() || new Date().toISOString(),
        language: full?.language || 'en',
        contentRating: full?.contentRating || 'ALL',
      },
      related,
    };
  }

  async getEngagement(slug: string, voterHash: string) {
    const website = await this.prisma.website.findUnique({
      where: { slug: slug.toLowerCase() },
      select: { id: true, starCount: true, stars: true },
    });

    if (!website) {
      throw new NotFoundException(`Website "${slug}" not found`);
    }

    const existingStar = await this.prisma.websiteStar.findUnique({
      where: {
        websiteId_voterHash: {
          websiteId: website.id,
          voterHash,
        },
      },
    });

    const isStarred = existingStar?.status === 'VALID';
    const currentStars = Math.max(website.stars || 0, website.starCount || 0);
    return {
      starCount: currentStars,
      stars: currentStars,
      starred: isStarred,
    };
  }

  async toggleStar(
    slug: string,
    voterHash: string,
    ipHash: string,
    star: boolean,
    ownerUserId?: string,
  ) {
    const website = await this.prisma.website.findUnique({
      where: { slug: slug.toLowerCase() },
      select: { id: true, ownerId: true, starCount: true, stars: true },
    });

    if (!website) {
      throw new NotFoundException(`Website "${slug}" not found`);
    }

    if (ownerUserId && website.ownerId === ownerUserId) {
      throw new ForbiddenException('Website owners cannot star their own website');
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.websiteStar.findUnique({
        where: {
          websiteId_voterHash: {
            websiteId: website.id,
            voterHash,
          },
        },
      });

      // Fetch accurate true current count inside transaction
      const currentWebsite = await tx.website.findUnique({
        where: { id: website.id },
        select: { stars: true, starCount: true },
      });
      const currentCount = Math.max(
        currentWebsite?.stars || 0,
        currentWebsite?.starCount || 0,
        website.stars || 0,
        website.starCount || 0,
      );

      if (star) {
        if (existing && existing.status === 'VALID') {
          return {
            starCount: currentCount,
            stars: currentCount,
            starred: true,
          };
        }

        if (existing) {
          await tx.websiteStar.update({
            where: { id: existing.id },
            data: { status: 'VALID' },
          });
        } else {
          await tx.websiteStar.create({
            data: {
              websiteId: website.id,
              voterHash,
              ipHash,
              status: 'VALID',
            },
          });
        }

        const newCount = currentCount + 1;
        const updated = await tx.website.update({
          where: { id: website.id },
          data: {
            starCount: newCount,
            stars: newCount,
          },
          select: { starCount: true, stars: true },
        });

        return {
          starCount: updated.starCount,
          stars: updated.stars,
          starred: true,
        };
      } else {
        // Unstar
        if (!existing || existing.status !== 'VALID') {
          return {
            starCount: currentCount,
            stars: currentCount,
            starred: false,
          };
        }

        await tx.websiteStar.update({
          where: { id: existing.id },
          data: { status: 'REMOVED' },
        });

        const newCount = Math.max(0, currentCount - 1);

        const updated = await tx.website.update({
          where: { id: website.id },
          data: {
            starCount: newCount,
            stars: newCount,
          },
          select: { starCount: true, stars: true },
        });

        return {
          starCount: updated.starCount,
          stars: updated.stars,
          starred: false,
        };
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Website Owner Methods
  // ---------------------------------------------------------------------------

  async getMyWebsite(ownerId: string) {
    const website = await this.prisma.website.findUnique({
      where: { ownerId },
      include: {
        category: true,
        tags: { include: { tag: true } },
        domains: {
          orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
        },
      },
    });

    if (!website || website.deletedAt) {
      throw new NotFoundException(
        'You do not have an active website associated with this account.',
      );
    }

    return {
      ...website,
      tags: website.tags.map((t) => t.tag),
    };
  }

  async updateMyWebsite(ownerId: string, input: UpdateWebsiteInput) {
    const website = await this.prisma.website.findUnique({ where: { ownerId } });
    if (!website || website.deletedAt) {
      throw new NotFoundException(
        'You do not have an active website associated with this account.',
      );
    }

    return this.prisma.website.update({
      where: { id: website.id },
      data: {
        ...(input.tagline !== undefined ? { tagline: input.tagline } : {}),
        ...(input.description ? { description: input.description } : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
        ...(input.coverUrl !== undefined ? { coverUrl: input.coverUrl } : {}),
        ...(input.contentRating ? { contentRating: input.contentRating } : {}),
        ...(input.socialLinks ? { socialLinks: input.socialLinks as Prisma.InputJsonValue } : {}),
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        domains: true,
      },
    });
  }

  async getMyWebsiteAnalytics(ownerId: string, range = '30d') {
    const website = await this.prisma.website.findUnique({
      where: { ownerId },
      include: {
        domains: {
          orderBy: { clickCount: 'desc' },
        },
      },
    });

    if (!website || website.deletedAt) {
      throw new NotFoundException(
        'You do not have an active website associated with this account.',
      );
    }

    const totalClicks = website.domains.reduce((acc, d) => acc + (d.clickCount || 0), 0);
    const totalDomains = website.domains.length;
    const onlineDomains = website.domains.filter((d) => d.status === 'ACTIVE').length;
    const uptimePercentage =
      totalDomains > 0 ? Math.round((onlineDomains / totalDomains) * 100) : 100;

    const domainsBreakdown = website.domains.map((d) => ({
      id: d.id,
      hostname: d.hostname,
      label: d.label,
      type: d.type,
      status: d.status,
      clickCount: d.clickCount || 0,
      lastResponseMs: d.lastResponseMs,
      sharePercentage: totalClicks > 0 ? Math.round(((d.clickCount || 0) / totalClicks) * 100) : 0,
    }));

    return {
      websiteName: website.name,
      websiteSlug: website.slug,
      range,
      totalClicks,
      totalDomains,
      onlineDomains,
      uptimePercentage,
      views: website.viewCount,
      domains: domainsBreakdown,
    };
  }

  // ---------------------------------------------------------------------------
  // Super Admin Methods
  // ---------------------------------------------------------------------------

  async findAllAdmin(
    page = 1,
    limit = 20,
    status?: WebsiteStatus,
    search?: string,
    categoryId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.WebsiteWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status as PrismaWebsiteStatus;
    }
    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rawItems, total] = await Promise.all([
      this.prisma.website.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true, slug: true } },
          domains: true,
          _count: { select: { domains: true } },
        },
      }),
      this.prisma.website.count({ where }),
    ]);

    // Apply custom category ordering if filtering by category
    let items = rawItems;
    if (categoryId && categoryId !== 'ALL') {
      const orderSetting = await this.prisma.setting.findUnique({
        where: { key: `category_order_${categoryId}` },
      });
      if (orderSetting && Array.isArray(orderSetting.value)) {
        const orderMap = new Map<string, number>();
        (orderSetting.value as string[]).forEach((id, idx) => {
          orderMap.set(id, idx);
        });
        items = [...rawItems].sort((a, b) => {
          const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
          const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
          return idxA - idxB;
        });
      }
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async reorderCategoryWebsites(
    categoryId: string,
    items: Array<{ id: string; sortOrder: number }>,
  ) {
    const updates = items.map((item) =>
      this.prisma.website.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    );
    await this.prisma.$transaction(updates);

    const orderedIds = [...items].sort((a, b) => a.sortOrder - b.sortOrder).map((i) => i.id);
    await this.prisma.setting.upsert({
      where: { key: `category_order_${categoryId}` },
      update: { value: orderedIds },
      create: { key: `category_order_${categoryId}`, value: orderedIds },
    });
    return { success: true, count: items.length };
  }

  async addStar(idOrSlug: string) {
    const website = await this.prisma.website.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }],
        deletedAt: null,
      },
    });
    if (!website) {
      throw new NotFoundException(`Website not found`);
    }

    const currentCount = Math.max(website.stars || 0, website.starCount || 0);
    const newCount = currentCount + 1;

    const updated = await this.prisma.website.update({
      where: { id: website.id },
      data: {
        stars: newCount,
        starCount: newCount,
      },
      select: { stars: true, starCount: true },
    });

    return { success: true, stars: updated.stars, starCount: updated.starCount };
  }

  async updateStars(id: string, stars: number) {
    const website = await this.prisma.website.findUnique({ where: { id } });
    if (!website) {
      throw new NotFoundException(`Website with ID "${id}" not found`);
    }

    const validStars = Math.max(0, Number(stars) || 0);
    const updated = await this.prisma.website.update({
      where: { id },
      data: {
        stars: validStars,
        starCount: validStars,
      },
    });

    return { success: true, stars: updated.stars, starCount: updated.starCount, website: updated };
  }

  async updateAdmin(id: string, input: UpdateWebsiteInput) {
    const website = await this.prisma.website.findUnique({ where: { id } });
    if (!website) {
      throw new NotFoundException(`Website with ID "${id}" not found`);
    }

    return this.prisma.website.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.tagline !== undefined ? { tagline: input.tagline } : {}),
        ...(input.description ? { description: input.description } : {}),
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
        ...(input.coverUrl !== undefined ? { coverUrl: input.coverUrl } : {}),
        ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
        ...(input.contentRating ? { contentRating: input.contentRating } : {}),
      },
    });
  }

  async updateStatus(id: string, status: WebsiteStatus) {
    const website = await this.prisma.website.findUnique({ where: { id } });
    if (!website) {
      throw new NotFoundException(`Website with ID "${id}" not found`);
    }

    return this.prisma.website.update({
      where: { id },
      data: { status: status as PrismaWebsiteStatus },
    });
  }

  async delete(id: string) {
    const website = await this.prisma.website.findUnique({ where: { id } });
    if (!website) {
      throw new NotFoundException(`Website with ID "${id}" not found`);
    }

    // Soft delete
    await this.prisma.website.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: `Website "${website.name}" has been deleted.` };
  }

  async createAdmin(input: CreateWebsiteAdminInput) {
    let resolvedOwnerId = input.ownerId;
    let tempPasswordDispatched: string | null = null;

    if (!resolvedOwnerId) {
      if (input.createdByAdmin || (!input.ownerEmail && !input.ownerName)) {
        // Created directly by Admin - No external owner account required
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

        const adminListingEmail = `admin+listing-${Date.now()}-${randomBytes(3).toString('hex')}@finallinks.internal`;
        const tempPassword = `Admin-${randomBytes(6).toString('hex')}!`;
        const passwordHash = await argon2.hash(tempPassword);

        const adminOwnerUser = await this.prisma.user.create({
          data: {
            email: adminListingEmail,
            name: `${input.name} (Admin)`,
            passwordHash,
            status: UserStatus.ACTIVE,
            mustChangePassword: false,
            roleId: ownerRole.id,
          },
        });
        resolvedOwnerId = adminOwnerUser.id;
      } else if (input.ownerEmail && input.ownerName) {
        const ownerEmail = input.ownerEmail.toLowerCase().trim();
        const existingUser = await this.prisma.user.findUnique({
          where: { email: ownerEmail },
          include: { website: true },
        });

        if (existingUser) {
          if (existingUser.website) {
            throw new BadRequestException(
              `User "${ownerEmail}" already owns a registered website: "${existingUser.website.name}".`,
            );
          }
          resolvedOwnerId = existingUser.id;
        } else {
          // Find or create Owner role
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

          const tempPassword = `Owner-${randomBytes(4).toString('hex').toUpperCase()}!9`;
          const passwordHash = await argon2.hash(tempPassword);

          const newUser = await this.prisma.user.create({
            data: {
              email: ownerEmail,
              name: input.ownerName.trim(),
              passwordHash,
              status: UserStatus.ACTIVE,
              mustChangePassword: true,
              roleId: ownerRole.id,
            },
          });
          resolvedOwnerId = newUser.id;
          tempPasswordDispatched = tempPassword;
        }
      } else {
        // Fallback: look for an active owner without a website
        const freeOwner = await this.prisma.user.findFirst({
          where: {
            role: { type: RoleType.WEBSITE_OWNER },
            website: null,
            deletedAt: null,
          },
        });
        if (freeOwner) {
          resolvedOwnerId = freeOwner.id;
        } else {
          throw new BadRequestException(
            'Please select an existing owner or provide Owner Name and Email to register this website.',
          );
        }
      }
    } else {
      const existingOwner = await this.prisma.user.findUnique({
        where: { id: resolvedOwnerId },
        include: { website: true },
      });
      if (!existingOwner) {
        throw new NotFoundException('Selected owner user not found.');
      }
      if (existingOwner.website) {
        throw new BadRequestException(
          `Owner "${existingOwner.name}" already has a registered website: "${existingOwner.website.name}".`,
        );
      }
    }

    // Generate unique slug
    let baseSlug = slugify(input.name) || 'website';
    let slug = baseSlug;
    let counter = 1;
    while (await this.prisma.website.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Create website
    const website = await this.prisma.website.create({
      data: {
        ownerId: resolvedOwnerId,
        name: input.name.trim(),
        slug,
        tagline: input.tagline?.trim() || null,
        description: input.description?.trim() || `Official directory listing for ${input.name}.`,
        categoryId: input.categoryId,
        contentRating: (input.contentRating as ContentRating) || ContentRating.ALL,
        status: PrismaWebsiteStatus.ACTIVE,
      },
      include: {
        category: true,
        owner: true,
      },
    });

    // Create primary domain
    let primaryDomain = null;
    if (input.primaryUrl && input.primaryUrl.trim()) {
      const rawUrl = input.primaryUrl.trim();
      const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
      const hostname = normalizeHostname(url);

      const existingDomain = await this.prisma.domain.findUnique({ where: { hostname } });
      if (!existingDomain) {
        primaryDomain = await this.prisma.domain.create({
          data: {
            websiteId: website.id,
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

    // If a new owner was created with temporary credentials, send email
    if (tempPasswordDispatched && website.owner) {
      const adminUrl = process.env.ADMIN_URL || 'http://localhost:3002';
      await this.mailService.sendRegistrationApprovedWithCredentialsEmail({
        to: website.owner.email,
        applicantName: website.owner.name,
        websiteName: website.name,
        tempPassword: tempPasswordDispatched,
        loginUrl: `${adminUrl}/login`,
      });
    }

    return {
      success: true,
      website,
      domain: primaryDomain,
      tempPassword: tempPasswordDispatched,
    };
  }
}
