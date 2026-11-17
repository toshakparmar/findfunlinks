import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReportInput, ReportStatus } from '@findfunlinks/contracts';
import { Request } from 'express';
import { ReportStatus as PrismaReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateReportInput, _req?: Request) {
    if (input.websiteId) {
      const website = await this.prisma.website.findUnique({
        where: { id: input.websiteId },
      });
      if (!website) {
        throw new NotFoundException(`Website with ID "${input.websiteId}" not found`);
      }
    }

    if (input.domainId) {
      const domain = await this.prisma.domain.findUnique({
        where: { id: input.domainId },
      });
      if (!domain) {
        throw new NotFoundException(`Domain with ID "${input.domainId}" not found`);
      }
    }

    return this.prisma.report.create({
      data: {
        websiteId: input.websiteId || null,
        domainId: input.domainId || null,
        reason: input.reason,
        details: input.details,
        reporterEmail: input.reporterEmail || null,
        status: PrismaReportStatus.PENDING,
      },
    });
  }

  async findAll(page = 1, limit = 20, status?: ReportStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as PrismaReportStatus } : {};

    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          website: {
            select: { id: true, name: true, slug: true },
          },
          domain: {
            select: { id: true, hostname: true, url: true, status: true },
          },
          handledBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, status: ReportStatus, handlerId: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }

    return this.prisma.report.update({
      where: { id },
      data: {
        status: status as PrismaReportStatus,
        handledById: handlerId,
      },
      include: {
        website: true,
        domain: true,
        handledBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
