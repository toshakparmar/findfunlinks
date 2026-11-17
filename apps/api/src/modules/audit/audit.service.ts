import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export interface CreateAuditLogOptions {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  req?: Request;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(options: CreateAuditLogOptions) {
    const ip = options.req ? options.req.ip || null : null;
    const userAgent = options.req ? options.req.get('user-agent') || null : null;

    return this.prisma.auditLog.create({
      data: {
        actorId: options.actorId || null,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        before: (options.before ?? Prisma.DbNull) as Prisma.InputJsonValue,
        after: (options.after ?? Prisma.DbNull) as Prisma.InputJsonValue,
        ip,
        userAgent,
      },
    });
  }

  async findAll(page = 1, limit = 20, entityType?: string, actorId?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.AuditLogWhereInput = {};

    if (entityType) {
      where.entityType = entityType;
    }
    if (actorId) {
      where.actorId = actorId;
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
