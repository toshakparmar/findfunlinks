import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WebsiteFilterParams, UpdateWebsiteInput, WebsiteStatus } from '@findfunlinks/contracts';
import { WebsiteStatus as PrismaWebsiteStatus, Prisma } from '@prisma/client';

@Injectable()
export class WebsitesService {
  constructor(private readonly prisma: PrismaService) {}

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
          orderBy: [{ isFeatured: 'desc' }, { viewCount: 'desc' }, { name: 'asc' }],
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
      category: website.category,
      tags: website.tags.map((t) => t.tag),
      domains: website.domains,
      createdAt: website.createdAt,
      updatedAt: website.updatedAt,
    };
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

  // ---------------------------------------------------------------------------
  // Super Admin Methods
  // ---------------------------------------------------------------------------

  async findAllAdmin(page = 1, limit = 20, status?: WebsiteStatus, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.WebsiteWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status as PrismaWebsiteStatus;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.website.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { domains: true } },
        },
      }),
      this.prisma.website.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
}
