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
  ResubmitRegistrationInput,
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

  private generateReferenceId(): string {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `FFL-${year}-${randomNum}`;
  }

  private generateVerificationToken(): string {
    return `ffl-verify-${randomBytes(8).toString('hex')}`;
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

    // 5. Generate unique reference ID
    let referenceId = this.generateReferenceId();
    let collision = await this.prisma.registrationRequest.findUnique({ where: { referenceId } });
    while (collision) {
      referenceId = this.generateReferenceId();
      collision = await this.prisma.registrationRequest.findUnique({ where: { referenceId } });
    }

    // 6. Generate verification token
    const verificationToken = this.generateVerificationToken();

    const ip = req ? req.ip || null : null;
    const userAgent = req ? req.get('user-agent') || null : null;

    const created = await this.prisma.registrationRequest.create({
      data: {
        referenceId,
        applicantName: input.applicantName.trim(),
        applicantEmail: normalizedEmail,
        applicantPhone: input.applicantPhone?.trim() || null,
        applicantRole: input.applicantRole || 'OWNER',
        applicantCountry: (input as any).applicantCountry || input.country || 'Global',
        telegramOrDiscord: input.telegramOrDiscord?.trim() || null,
        websiteName: input.websiteName.trim(),
        primaryUrl: input.primaryUrl.trim(),
        additionalDomains: input.additionalDomains || [],
        description: input.description.trim(),
        categoryId: input.categoryId,
        proposedTags: input.proposedTags || [],
        logoUrl: input.logoUrl || null,
        language: input.language || 'en',
        contentRating: input.contentRating || 'ALL',
        verificationMethod: input.verificationMethod || 'DNS_TXT',
        verificationToken,
        verificationProof: input.verificationProof?.trim() || null,
        adminNote: input.adminNote?.trim() || null,
        status: PrismaRegistrationStatus.PENDING,
        ip,
        userAgent,
      },
    });

    // 7. Dispatch confirmation email (non-blocking)
    try {
      await this.mailService.sendRegistrationConfirmationEmail(
        normalizedEmail,
        input.applicantName.trim(),
        input.websiteName.trim(),
        referenceId,
        input.verificationMethod || 'DNS_TXT',
        verificationToken,
      );
    } catch {
      // Logged in mail service
    }

    return {
      success: true,
      referenceId: created.referenceId,
      id: created.id,
      websiteName: created.websiteName,
      status: created.status,
      verificationToken: created.verificationToken,
      verificationMethod: created.verificationMethod,
      submittedAt: created.submittedAt,
    };
  }

  async getStatus(ref: string, email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRef = ref.toUpperCase().trim();

    const request = await this.prisma.registrationRequest.findFirst({
      where: {
        referenceId: { equals: normalizedRef, mode: 'insensitive' },
        applicantEmail: { equals: normalizedEmail, mode: 'insensitive' },
      },
      include: {
        reviewer: {
          select: { name: true, email: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('No registration request found for this Reference ID and Email.');
    }

    return {
      referenceId: request.referenceId,
      id: request.id,
      websiteName: request.websiteName,
      primaryUrl: request.primaryUrl,
      additionalDomains: request.additionalDomains,
      applicantName: request.applicantName,
      applicantRole: request.applicantRole,
      status: request.status,
      description: request.description,
      submittedAt: request.submittedAt,
      reviewedAt: request.reviewedAt,
      reviewNote: request.reviewNote,
      verificationMethod: request.verificationMethod,
      verificationToken: request.verificationToken,
      verificationProof: request.verificationProof,
      categoryId: request.categoryId,
    };
  }

  async resubmit(input: ResubmitRegistrationInput, req?: Request) {
    if (!input.email || !input.ref) {
      throw new BadRequestException('Both Reference ID ("ref") and Email ("email") are required.');
    }
    const normalizedEmail = input.email.toLowerCase().trim();
    const normalizedRef = input.ref.toUpperCase().trim();

    const request = await this.prisma.registrationRequest.findFirst({
      where: {
        referenceId: { equals: normalizedRef, mode: 'insensitive' },
        applicantEmail: { equals: normalizedEmail, mode: 'insensitive' },
      },
    });

    if (!request) {
      throw new NotFoundException('Registration request not found.');
    }

    if (
      request.status !== PrismaRegistrationStatus.CHANGES_REQUESTED &&
      request.status !== PrismaRegistrationStatus.PENDING
    ) {
      throw new BadRequestException(
        'This registration request cannot be modified in its current status.',
      );
    }

    const updated = await this.prisma.registrationRequest.update({
      where: { id: request.id },
      data: {
        primaryUrl: input.primaryUrl ? input.primaryUrl.trim() : undefined,
        additionalDomains: input.additionalDomains ? input.additionalDomains : undefined,
        verificationMethod: input.verificationMethod ? input.verificationMethod : undefined,
        verificationProof:
          input.verificationProof !== undefined ? input.verificationProof.trim() : undefined,
        description: input.description ? input.description.trim() : undefined,
        adminNote: input.adminNote !== undefined ? input.adminNote.trim() : undefined,
        status: PrismaRegistrationStatus.PENDING,
        updatedAt: new Date(),
      },
    });

    if (req) {
      await this.auditService.log({
        action: 'REGISTRATION_RESUBMITTED',
        entityType: 'RegistrationRequest',
        entityId: request.id,
        after: { referenceId: updated.referenceId, status: updated.status },
        req,
      });
    }

    return {
      success: true,
      message: 'Application updated successfully and returned to review queue.',
      referenceId: updated.referenceId,
      status: updated.status,
    };
  }

  async getPendingCount(): Promise<{ count: number }> {
    const count = await this.prisma.registrationRequest.count({
      where: {
        status: PrismaRegistrationStatus.PENDING,
      },
    });
    return { count };
  }

  async getRegistrationForEdit(token: string) {
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

    return {
      registration: request,
    };
  }

  async updateRegistrationWithToken(token: string, body: Partial<RegistrationSubmitInput>) {
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
      throw new BadRequestException('Invalid or expired token');
    }

    const request = await this.prisma.registrationRequest.findUnique({
      where: { id: tokenRecord.userId },
    });

    if (!request || request.status !== PrismaRegistrationStatus.CHANGES_REQUESTED) {
      throw new BadRequestException('Request is not in a modifiable state');
    }

    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.registrationRequest.update({
        where: { id: request.id },
        data: {
          websiteName: body.websiteName ? body.websiteName.trim() : undefined,
          primaryUrl: body.primaryUrl ? body.primaryUrl.trim() : undefined,
          additionalDomains: body.additionalDomains ? body.additionalDomains : undefined,
          description: body.description ? body.description.trim() : undefined,
          categoryId: body.categoryId || undefined,
          proposedTags: body.proposedTags || undefined,
          logoUrl: body.logoUrl || undefined,
          verificationMethod: body.verificationMethod || undefined,
          verificationProof: body.verificationProof ? body.verificationProof.trim() : undefined,
          adminNote: body.adminNote ? body.adminNote.trim() : undefined,
          status: PrismaRegistrationStatus.PENDING,
          reviewNote: null,
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
        { referenceId: { contains: search, mode: 'insensitive' } },
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

    // Execute atomic transaction for user, website, domains, invite token, and request update
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. User
      let userId: string;
      if (!existingUser) {
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

      // 4. Primary Domain
      const primaryDomain = await tx.domain.create({
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

      // 4b. Additional Mirrors
      if (reg.additionalDomains && Array.isArray(reg.additionalDomains)) {
        for (const mirrorUrl of reg.additionalDomains) {
          try {
            const mirrorHostname = this.normalizeHostname(mirrorUrl);
            const exists = await tx.domain.findUnique({ where: { hostname: mirrorHostname } });
            if (!exists) {
              await tx.domain.create({
                data: {
                  websiteId: website.id,
                  hostname: mirrorHostname,
                  url: mirrorUrl,
                  label: 'Mirror Domain',
                  type: DomainType.MIRROR,
                  status: DomainStatus.ACTIVE,
                  isPublic: true,
                  addedById: reviewerId,
                },
              });
            }
          } catch {
            // Ignore format issues on secondary mirrors
          }
        }
      }

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
        domain: primaryDomain,
        registration: updatedReg,
      };
    });

    // 7. Audit log
    await this.auditService.log({
      actorId: reviewerId,
      action: 'REGISTRATION_APPROVED',
      entityType: 'RegistrationRequest',
      entityId: reg.id,
      before: { status: reg.status },
      after: {
        status: PrismaRegistrationStatus.APPROVED,
        resultingUserId: result.userId,
        resultingWebsiteId: result.website.id,
      },
      req,
    });

    // 8. Send transactional invite email with 24h setup link
    const ownerPanelUrl = process.env.OWNER_PANEL_URL || 'http://localhost:3002';
    const inviteUrl = `${ownerPanelUrl}/setup-password?token=${rawInviteToken}`;
    await this.mailService.sendInviteEmail(
      reg.applicantEmail,
      reg.applicantName,
      reg.websiteName,
      inviteUrl,
    );

    return {
      message: 'Registration request approved. Owner account and directory entries created.',
      userId: result.userId,
      websiteId: result.website.id,
      slug: result.website.slug,
      inviteUrl,
    };
  }

  async reject(id: string, reviewerId: string, input: ReviewRegistrationInput, req?: Request) {
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
        `Cannot reject request with status "${reg.status}". It may have already been processed.`,
      );
    }

    const updated = await this.prisma.registrationRequest.update({
      where: { id },
      data: {
        status: PrismaRegistrationStatus.REJECTED,
        reviewerId,
        reviewNote: input.reviewNote || 'Application does not meet directory listing standards.',
        reviewedAt: new Date(),
      },
    });

    await this.auditService.log({
      actorId: reviewerId,
      action: 'REGISTRATION_REJECTED',
      entityType: 'RegistrationRequest',
      entityId: reg.id,
      before: { status: reg.status },
      after: { status: PrismaRegistrationStatus.REJECTED, reviewNote: updated.reviewNote },
      req,
    });

    await this.mailService.sendRejectionEmail(
      reg.applicantEmail,
      reg.applicantName,
      reg.websiteName,
      updated.reviewNote || 'Application does not meet our curation standards.',
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
    const reg = await this.prisma.registrationRequest.findUnique({
      where: { id },
    });

    if (!reg) {
      throw new NotFoundException(`Registration request "${id}" not found`);
    }

    if (reg.status !== PrismaRegistrationStatus.PENDING) {
      throw new BadRequestException(
        `Changes can only be requested for PENDING applications (current status: ${reg.status})`,
      );
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.token.create({
      data: {
        userId: reg.id,
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
        reviewNote: input.reviewNote || 'Additional verification information requested.',
        reviewedAt: new Date(),
      },
    });

    await this.auditService.log({
      actorId: reviewerId,
      action: 'REGISTRATION_CHANGES_REQUESTED',
      entityType: 'RegistrationRequest',
      entityId: reg.id,
      before: { status: reg.status },
      after: { status: PrismaRegistrationStatus.CHANGES_REQUESTED, reviewNote: updated.reviewNote },
      req,
    });

    const webUrl = process.env.WEB_URL || 'http://localhost:3000';
    const statusUrl = `${webUrl}/register/status?ref=${reg.referenceId}&email=${encodeURIComponent(reg.applicantEmail)}`;
    await this.mailService.sendChangesRequestedEmail(
      reg.applicantEmail,
      reg.applicantName,
      reg.websiteName,
      updated.reviewNote || 'Please verify domain ownership or provide updated link details.',
      statusUrl,
    );

    return {
      message: 'Changes requested and notification sent to applicant.',
      registration: updated,
    };
  }
}
