import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateReportInput, ReportStatus } from '@finallinks/contracts';
import { Request } from 'express';
import { ReportStatus as PrismaReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

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

  async getMyReports(user: { id: string; email: string }) {
    const website = await this.prisma.website.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });

    const where: any = {
      OR: [{ reporterEmail: user.email }, ...(website ? [{ websiteId: website.id }] : [])],
    };

    return this.prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        website: { select: { id: true, name: true, slug: true } },
        domain: { select: { id: true, hostname: true, url: true } },
        handledBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async createOwnerTicket(
    user: { id: string; email: string },
    input: { reason: string; details: string; domainId?: string },
  ) {
    const website = await this.prisma.website.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });

    return this.prisma.report.create({
      data: {
        websiteId: website?.id || null,
        domainId: input.domainId || null,
        reason: input.reason,
        details: input.details,
        reporterEmail: user.email,
        status: PrismaReportStatus.PENDING,
      },
      include: {
        website: { select: { id: true, name: true, slug: true } },
        domain: { select: { id: true, hostname: true, url: true } },
      },
    });
  }

  async findAll(page = 1, limit = 20, status?: ReportStatus, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) {
      where.status = status as PrismaReportStatus;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { reason: { contains: q, mode: 'insensitive' } },
        { details: { contains: q, mode: 'insensitive' } },
        { reporterEmail: { contains: q, mode: 'insensitive' } },
        { website: { name: { contains: q, mode: 'insensitive' } } },
        { domain: { hostname: { contains: q, mode: 'insensitive' } } },
      ];
    }

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

  async reply(id: string, message: string, handlerId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { website: true, domain: true },
    });
    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }

    if (report.reporterEmail) {
      await this.mailService.sendSupportReplyEmail(
        report.reporterEmail,
        report.id,
        report.reason || 'Report Inquiry',
        message,
      );
    }

    return this.prisma.report.update({
      where: { id },
      data: {
        status: PrismaReportStatus.RESOLVED,
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
