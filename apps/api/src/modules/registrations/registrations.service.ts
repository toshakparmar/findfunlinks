import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import {
  RegistrationSubmitInput,
  RegistrationStatus,
  ReviewRegistrationInput,
} from '@findfunlinks/contracts';
import {
  RegistrationStatus as PrismaRegistrationStatus,
  TokenType,
  UserStatus,
  DomainType,
  DomainStatus,
  WebsiteStatus,
} from '@prisma/client';
import { randomBytes, createHash } from 'crypto';
import { Request } from 'express';
import * as argon2 from 'argon2';

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
  ) {}

  private normalizeHostname(urlStr: string): string {
    try {
      const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return url.hostname.toLowerCase();
    } catch {
      throw new BadRequestException(`Invalid URL format: ${urlStr}`);
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // ---------------------------------------------------------------------------
  // Public Methods
  // ---------------------------------------------------------------------------

  async submitRegistration(input: RegistrationSubmitInput, req?: Request) {
    // 1. Honeypot check for bot spam defense
    if (input.honeypot && input.honeypot.trim().length > 0) {
      throw new BadRequestException('Spam detected');
    }

    const normalizedEmail = input.applicantEmail.toLowerCase().trim();
    const normalizedHostname = this.normalizeHostname(input.primaryUrl);

    // 2. Duplicate detection: check existing active domains / websites
    const existingDomain = await this.prisma.domain.findUnique({
      where: { hostname: normalizedHostname },
    });
    if (existingDomain) {
      throw new ConflictException(
        `A website with domain "${normalizedHostname}" is already listed on FindFunLinks.`,
      );
    }

    // 3. Duplicate detection: check pending registration requests
    const pendingRequest = await this.prisma.registrationRequest.findFirst({
      where: {
        status: {
          in: [PrismaRegistrationStatus.PENDING, PrismaRegistrationStatus.CHANGES_REQUESTED],
        },
        OR: [{ applicantEmail: normalizedEmail }, { primaryUrl: { contains: normalizedHostname } }],
      },
    });

    if (pendingRequest) {
      if (pendingRequest.applicantEmail === normalizedEmail) {
        throw new ConflictException(
          'An active registration request from this email address is already under review.',
        );
      }
      throw new ConflictException(
        `A registration request for domain "${normalizedHostname}" is already pending review.`,
      );
    }

    // 4. Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new BadRequestException('Selected category does not exist');
    }

    const ip = req ? req.ip || null : null;
    const userAgent = req ? req.get('user-agent') || null : null;

    return this.prisma.registrationRequest.create({
      data: {
        applicantName: input.applicantName.trim(),
        applicantEmail: normalizedEmail,
        applicantPhone: input.applicantPhone?.trim() || null,
        applicantCountry: (input as any).applicantCountry || input.country || 'Global',
        telegramOrDiscord: input.telegramOrDiscord?.trim() || null,
        websiteName: input.websiteName.trim(),
        primaryUrl: input.primaryUrl.trim(),
        description: input.description.trim(),
        categoryId: input.categoryId,
        proposedTags: input.proposedTags || [],
        logoUrl: input.logoUrl || null,
        language: input.language || 'en',
        contentRating: input.contentRating || 'ALL',
        status: PrismaRegistrationStatus.PENDING,
        ip,
        userAgent,
      },
    });
  }

  async getRegistrationForEdit(token: string) {
    const tokenHash = this.hashToken(token);
    const tokenRecord = await this.prisma.token.findFirst({
      where: {
        tokenHash,
        type: TokenType.PASSWORD_RESET, // Re-used for edit token
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired application edit token');
    }

    const request = await this.prisma.registrationRequest.findUnique({
      where: { id: tokenRecord.userId }, // Stores registrationId in userId column for edit tokens
    });

    if (!request || request.status !== PrismaRegistrationStatus.CHANGES_REQUESTED) {
      throw new BadRequestException('This registration request is not eligible for edits');
    }

    return {
      registration: request,
    };
  }

  async updateRegistrationWithToken(token: string, updates: Partial<RegistrationSubmitInput>) {
    const tokenHash = this.hashToken(token);
    const tokenRecord = await this.prisma.token.findFirst({
      where: {
        tokenHash,
        type: TokenType.PASSWORD_RESET,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired application edit token');
    }

    const request = await this.prisma.registrationRequest.findUnique({
      where: { id: tokenRecord.userId },
    });

    if (!request || request.status !== PrismaRegistrationStatus.CHANGES_REQUESTED) {
      throw new BadRequestException('This registration request is not eligible for edits');
    }

    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.registrationRequest.update({
        where: { id: request.id },
        data: {
          websiteName: updates.websiteName ? updates.websiteName.trim() : request.websiteName,
          primaryUrl: updates.primaryUrl ? updates.primaryUrl.trim() : request.primaryUrl,
          description: updates.description ? updates.description.trim() : request.description,
          categoryId: updates.categoryId || request.categoryId,
          proposedTags: updates.proposedTags || request.proposedTags,
          logoUrl: updates.logoUrl !== undefined ? updates.logoUrl : request.logoUrl,
          status: PrismaRegistrationStatus.PENDING,
        },
      }),
      this.prisma.token.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return {
      message: 'Registration updated and resubmitted for review successfully.',
      registration: updatedRequest,
    };
  }

  // ---------------------------------------------------------------------------
  // Admin Methods
  // ---------------------------------------------------------------------------

  async findAllAdmin(page = 1, limit = 20, status?: RegistrationStatus, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status as PrismaRegistrationStatus;
    }
    if (search) {
      where.OR = [
        { websiteName: { contains: search, mode: 'insensitive' } },
        { applicantEmail: { contains: search, mode: 'insensitive' } },
        { applicantName: { contains: search, mode: 'insensitive' } },
        { primaryUrl: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.registrationRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          reviewer: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.registrationRequest.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneAdmin(id: string) {
    const request = await this.prisma.registrationRequest.findUnique({
      where: { id },
      include: {
        reviewer: { select: { id: true, name: true, email: true } },
      },
    });

    if (!request) {
      throw new NotFoundException(`Registration request "${id}" not found`);
    }

    const [resultingUser, resultingWebsite] = await Promise.all([
      request.resultingUserId
        ? this.prisma.user.findUnique({
            where: { id: request.resultingUserId },
            select: { id: true, name: true, email: true, status: true },
          })
        : null,
      request.resultingWebsiteId
        ? this.prisma.website.findUnique({
            where: { id: request.resultingWebsiteId },
            select: { id: true, name: true, slug: true, status: true, domains: true },
          })
        : null,
    ]);

    return {
      ...request,
      resultingUser,
      resultingWebsite,
    };
  }

  async approve(id: string, reviewerId: string, req?: Request) {
    const reg = await this.prisma.registrationRequest.findUnique({
      where: { id },
    });

    if (!reg) {
      throw new NotFoundException(`Registration request "${id}" not found`);
    }

    if (
      reg.status !== PrismaRegistrationStatus.PENDING &&
      reg.status !== PrismaRegistrationStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException(
        `Cannot approve request with current status "${reg.status}". Only PENDING or CHANGES_REQUESTED can be approved.`,
      );
    }

    // Check if user already exists
    let existingUser = await this.prisma.user.findUnique({
      where: { email: reg.applicantEmail },
      include: { website: true },
    });

    if (existingUser && existingUser.website) {
      throw new ConflictException(
        `Applicant "${reg.applicantEmail}" already owns an active website ("${existingUser.website.name}"). As per platform rules, one owner may manage only one website.`,
      );
    }

    // Normalized hostname for initial domain
    const hostname = this.normalizeHostname(reg.primaryUrl);
    const existingDomain = await this.prisma.domain.findUnique({ where: { hostname } });
    if (existingDomain) {
      throw new ConflictException(
        `Hostname "${hostname}" is already registered to website ID ${existingDomain.websiteId}.`,
      );
    }

    // Base slug generation
    let baseSlug = this.slugify(reg.websiteName);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await this.prisma.website.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    // Role for Website Owner
    const ownerRole = await this.prisma.role.findUnique({
      where: { name: 'Website Owner' },
    });
    if (!ownerRole) {
      throw new BadRequestException('System role "Website Owner" not found. Run db:seed.');
    }

    // 24h Invite Token generation
    const rawInviteToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawInviteToken);
    const inviteExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Execute atomic transaction for user, website, domain, invite token, and request update
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. User
      let userId: string;
      if (!existingUser) {
        // High-entropy placeholder password until the user sets their password via 24h invite link
        const tempPasswordHash = await argon2.hash(randomBytes(32).toString('hex'));
        const newUser = await tx.user.create({
          data: {
            email: reg.applicantEmail,
            name: reg.applicantName,
            passwordHash: tempPasswordHash,
            status: UserStatus.INVITED,
            mustChangePassword: false,
            roleId: ownerRole.id,
          },
        });
        userId = newUser.id;
      } else {
        userId = existingUser.id;
      }

      // 2. Website
      const website = await tx.website.create({
        data: {
          name: reg.websiteName,
          slug: uniqueSlug,
          description: reg.description,
          categoryId: reg.categoryId,
          ownerId: userId,
          logoUrl: reg.logoUrl,
          language: reg.language,
          contentRating: reg.contentRating,
          status: WebsiteStatus.ACTIVE,
        },
      });

      // 3. Connect Tags
      if (reg.proposedTags && reg.proposedTags.length > 0) {
        for (const tagName of reg.proposedTags) {
          const tagSlug = this.slugify(tagName);
          if (!tagSlug) continue;

          const tag = await tx.tag.upsert({
            where: { slug: tagSlug },
            update: {},
            create: { name: tagName.trim(), slug: tagSlug },
          });

          await tx.websiteTag.create({
            data: { websiteId: website.id, tagId: tag.id },
          });
        }
      }

      // 4. Initial Domain
      const domain = await tx.domain.create({
        data: {
          websiteId: website.id,
          hostname,
          url: reg.primaryUrl,
          label: 'Primary Domain',
          type: DomainType.PRIMARY,
          status: DomainStatus.ACTIVE,
          isPublic: true,
          addedById: reviewerId,
        },
      });

      // 5. Expiring single-use invite token
      await tx.token.create({
        data: {
          userId,
          tokenHash,
          type: TokenType.INVITE,
          expiresAt: inviteExpiresAt,
        },
      });

      // 6. Update Registration Request
      const updatedReg = await tx.registrationRequest.update({
        where: { id: reg.id },
        data: {
          status: PrismaRegistrationStatus.APPROVED,
          reviewerId,
          reviewedAt: new Date(),
          resultingUserId: userId,
          resultingWebsiteId: website.id,
        },
      });

      return {
        userId,
        website,
        domain,
        registration: updatedReg,
      };
    });

    // 7. Audit log
    await this.auditService.log({
      actorId: reviewerId,
      action: 'REGISTRATION_APPROVED',
      entityType: 'RegistrationRequest',
      entityId: reg.id,
      after: {
        websiteId: result.website.id,
        userId: result.userId,
        domainId: result.domain.id,
      },
      req,
    });

    // 8. Send activation email with 24-hour setup link
    const inviteUrl = `${process.env.OWNER_PANEL_URL || 'http://localhost:3002'}/auth/accept-invite?token=${rawInviteToken}`;
    await this.mailService.sendInviteEmail(
      reg.applicantEmail,
      reg.applicantName,
      reg.websiteName,
      inviteUrl,
    );

    return {
      message: 'Registration request successfully approved. Website and owner account created.',
      website: result.website,
      domain: result.domain,
      userId: result.userId,
      rawInviteToken, // For testing environments
    };
  }

  async reject(id: string, reviewerId: string, input: ReviewRegistrationInput, req?: Request) {
    if (!input.reviewNote || input.reviewNote.trim().length === 0) {
      throw new BadRequestException('A reason for rejection must be provided to the applicant.');
    }

    const reg = await this.prisma.registrationRequest.findUnique({ where: { id } });
    if (!reg) {
      throw new NotFoundException(`Registration request "${id}" not found`);
    }

    if (
      reg.status !== PrismaRegistrationStatus.PENDING &&
      reg.status !== PrismaRegistrationStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException(
        `Cannot reject request with status "${reg.status}". Only PENDING or CHANGES_REQUESTED can be rejected.`,
      );
    }

    const updated = await this.prisma.registrationRequest.update({
      where: { id },
      data: {
        status: PrismaRegistrationStatus.REJECTED,
        reviewerId,
        reviewNote: input.reviewNote.trim(),
        reviewedAt: new Date(),
      },
    });

    await this.auditService.log({
      actorId: reviewerId,
      action: 'REGISTRATION_REJECTED',
      entityType: 'RegistrationRequest',
      entityId: id,
      after: { reason: input.reviewNote },
      req,
    });

    await this.mailService.sendRejectionEmail(
      reg.applicantEmail,
      reg.applicantName,
      reg.websiteName,
      input.reviewNote,
    );

    return {
      message: 'Registration request rejected and applicant notified.',
      registration: updated,
    };
  }

  async requestChanges(
    id: string,
    reviewerId: string,
    input: ReviewRegistrationInput,
    req?: Request,
  ) {
    if (!input.reviewNote || input.reviewNote.trim().length === 0) {
      throw new BadRequestException('Notes explaining the requested changes are required.');
    }

    const reg = await this.prisma.registrationRequest.findUnique({ where: { id } });
    if (!reg) {
      throw new NotFoundException(`Registration request "${id}" not found`);
    }

    if (reg.status !== PrismaRegistrationStatus.PENDING) {
      throw new BadRequestException(
        `Cannot request changes on request with status "${reg.status}". Only PENDING requests can be updated.`,
      );
    }

    const rawEditToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawEditToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days to update

    // Create edit token (using system admin id as owner of the token entry, and store reg.id)
    await this.prisma.token.create({
      data: {
        userId: reviewerId,
        tokenHash,
        type: TokenType.PASSWORD_RESET,
        expiresAt,
      },
    });

    const updated = await this.prisma.registrationRequest.update({
      where: { id },
      data: {
        status: PrismaRegistrationStatus.CHANGES_REQUESTED,
        reviewerId,
        reviewNote: input.reviewNote.trim(),
        reviewedAt: new Date(),
      },
    });

    await this.auditService.log({
      actorId: reviewerId,
      action: 'REGISTRATION_CHANGES_REQUESTED',
      entityType: 'RegistrationRequest',
      entityId: id,
      after: { note: input.reviewNote },
      req,
    });

    const editUrl = `${process.env.WEB_URL || 'http://localhost:3000'}/register/edit?token=${rawEditToken}`;
    await this.mailService.sendChangesRequestedEmail(
      reg.applicantEmail,
      reg.applicantName,
      reg.websiteName,
      input.reviewNote,
      editUrl,
    );

    return {
      message: 'Changes requested from applicant and edit link dispatched.',
      registration: updated,
      rawEditToken, // For testing environments
    };
  }
}
