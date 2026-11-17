import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

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

    if (!user) {
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
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, status: true },
    });
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, email: true, deletedAt: true },
    });
  }
}
