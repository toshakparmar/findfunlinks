import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTagInput, UpdateTagInput } from '@findfunlinks/contracts';
import { WebsiteStatus } from '@prisma/client';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            websites: {
              where: {
                website: {
                  status: WebsiteStatus.ACTIVE,
                  deletedAt: null,
                },
              },
            },
          },
        },
      },
    });

    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      websiteCount: t._count.websites,
    }));
  }

  async create(input: CreateTagInput) {
    const existing = await this.prisma.tag.findUnique({
      where: { slug: input.slug.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`Tag with slug "${input.slug}" already exists`);
    }

    return this.prisma.tag.create({
      data: {
        name: input.name,
        slug: input.slug.toLowerCase(),
      },
    });
  }

  async update(id: string, input: UpdateTagInput) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    if (input.slug && input.slug.toLowerCase() !== tag.slug) {
      const slugExists = await this.prisma.tag.findUnique({
        where: { slug: input.slug.toLowerCase() },
      });
      if (slugExists) {
        throw new ConflictException(`Tag with slug "${input.slug}" already exists`);
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.slug ? { slug: input.slug.toLowerCase() } : {}),
      },
    });
  }

  async delete(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    await this.prisma.tag.delete({ where: { id } });
    return { message: `Tag "${tag.name}" deleted successfully` };
  }
}
