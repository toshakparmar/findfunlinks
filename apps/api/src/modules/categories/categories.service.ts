import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryInput, UpdateCategoryInput } from '@finallinks/contracts';
import { WebsiteStatus } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            websites: {
              where: {
                status: WebsiteStatus.ACTIVE,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      sortOrder: c.sortOrder,
      homeLimit: c.homeLimit ?? 10,
      websiteCount: c._count.websites,
    }));
  }

  async findBySlug(slug: string, page = 1, limit = 20) {
    const category = await this.prisma.category.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    const skip = (page - 1) * limit;
    const [websites, totalWebsites] = await Promise.all([
      this.prisma.website.findMany({
        where: {
          categoryId: category.id,
          status: WebsiteStatus.ACTIVE,
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { viewCount: 'desc' }, { name: 'asc' }],
        include: {
          domains: {
            where: { isPublic: true },
            orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
          },
          tags: {
            include: { tag: true },
          },
        },
      }),
      this.prisma.website.count({
        where: {
          categoryId: category.id,
          status: WebsiteStatus.ACTIVE,
          deletedAt: null,
        },
      }),
    ]);

    return {
      category,
      websites: websites.map((w) => ({
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
      pagination: {
        page,
        limit,
        total: totalWebsites,
        totalPages: Math.ceil(totalWebsites / limit),
      },
    };
  }

  async findAllAdmin() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { websites: true },
        },
      },
    });
  }

  async create(input: CreateCategoryInput) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: input.slug.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`Category slug "${input.slug}" already exists`);
    }

    return this.prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug.toLowerCase(),
        description: input.description,
        icon: input.icon,
        sortOrder: input.sortOrder ?? 0,
        homeLimit: input.homeLimit ?? 10,
        isActive: input.isActive ?? true,
      },
    });
  }

  async update(id: string, input: UpdateCategoryInput) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    if (input.slug && input.slug.toLowerCase() !== category.slug) {
      const slugExists = await this.prisma.category.findUnique({
        where: { slug: input.slug.toLowerCase() },
      });
      if (slugExists) {
        throw new ConflictException(`Category slug "${input.slug}" already exists`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.slug ? { slug: input.slug.toLowerCase() } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        ...(input.homeLimit !== undefined ? { homeLimit: input.homeLimit } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
  }

  async delete(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { websites: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    if (category._count.websites > 0) {
      throw new BadRequestException(
        `Cannot delete category "${category.name}" because it contains ${category._count.websites} active website(s). Reassign them first.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: `Category "${category.name}" deleted successfully` };
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return { message: 'Categories reordered successfully' };
  }
}
