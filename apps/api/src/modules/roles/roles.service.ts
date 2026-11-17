import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleType } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      type: r.type,
      userCount: r._count.users,
      permissions: r.permissions.map((rp) => rp.permission.key),
      createdAt: r.createdAt,
    }));
  }

  async getAllPermissions() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { key: 'asc' }],
    });

    const grouped: Record<string, typeof permissions> = {};
    for (const p of permissions) {
      if (!grouped[p.module]) {
        grouped[p.module] = [];
      }
      grouped[p.module]!.push(p);
    }

    return {
      permissions,
      grouped,
    };
  }

  async create(name: string, description: string | undefined, permissionKeys: string[]) {
    const existing = await this.prisma.role.findUnique({ where: { name } });
    if (existing) {
      throw new BadRequestException(`Role with name "${name}" already exists`);
    }

    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    });

    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          name,
          description,
          type: RoleType.CUSTOM,
          isSystem: false,
        },
      });

      if (permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map((p) => ({
            roleId: role.id,
            permissionId: p.id,
          })),
        });
      }

      return role;
    });
  }

  async updatePermissions(roleId: string, permissionKeys: string[]) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem && role.type === RoleType.SUPER_ADMIN) {
      throw new ForbiddenException('Super Admin permissions cannot be modified');
    }

    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    });

    return this.prisma.$transaction(async (tx) => {
      // Remove current permissions
      await tx.rolePermission.deleteMany({ where: { roleId } });

      // Add new permissions
      if (permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map((p) => ({
            roleId,
            permissionId: p.id,
          })),
        });
      }

      return { message: 'Role permissions updated successfully' };
    });
  }

  async delete(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new ForbiddenException('System roles cannot be deleted');
    }

    if (role._count.users > 0) {
      throw new BadRequestException(
        `Cannot delete role because it is assigned to ${role._count.users} user(s)`,
      );
    }

    await this.prisma.role.delete({ where: { id: roleId } });
    return { message: 'Role deleted successfully' };
  }
}
