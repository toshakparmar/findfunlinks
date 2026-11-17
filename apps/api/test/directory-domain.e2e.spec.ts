import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { HealthCheckService } from '../src/modules/health-check/health-check.service';

describe('Phase 3: Directory Domain & Complete Workflow (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let healthCheckService: HealthCheckService;

  let superAdminAccessToken: string;
  let starterCategoryId: string;

  // Tracked throughout the registration -> approval -> owner lifecycle
  const testApplicantEmail = `applicant_${randomUUID().slice(0, 8)}@example.com`;
  const testWebsiteName = `Awesome Anime Portal ${randomUUID().slice(0, 6)}`;
  const testPrimaryUrl = `https://portal-${randomUUID().slice(0, 8)}.fun`;

  let registrationRequestId: string;
  let rawInviteToken: string;
  let ownerAccessToken: string;
  let createdWebsiteId: string;
  let createdDomainId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(APP_GUARD)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.setGlobalPrefix('api/v1');

    await app.init();
    prisma = app.get(PrismaService);
    healthCheckService = app.get(HealthCheckService);

    // Authenticate Super Admin
    const loginRes = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: 'admin@findfunlinks.com',
      password: 'SuperAdminSecretPass123!',
    });
    superAdminAccessToken = loginRes.body.data.accessToken;

    // Grab a starter category ID
    const cat = await prisma.category.findFirst({ where: { isActive: true } });
    starterCategoryId = cat!.id;
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  }, 30000);

  // ===========================================================================
  // 1. PUBLIC CATEGORIES, TAGS & SETTINGS
  // ===========================================================================
  describe('1. Public Discovery Endpoints', () => {
    it('GET /api/v1/categories - returns active categories with website counts', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('slug');
      expect(res.body.data[0]).toHaveProperty('websiteCount');
    });

    it('GET /api/v1/tags - returns discoverability tags', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/tags');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/settings/public - returns public branding and feature toggles', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/settings/public');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.site_name).toBe('FindFunLinks');
      expect(res.body.data.registrations_enabled).toBe(true);
    });
  });

  // ===========================================================================
  // 2. REGISTRATION SUBMISSION & BOT DEFENSE
  // ===========================================================================
  describe('2. Registration Submission & Bot Defense', () => {
    it('rejects bot submission when honeypot field is filled', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/registrations').send({
        applicantName: 'Spam Bot',
        applicantEmail: 'bot@spam.com',
        websiteName: 'Spam Portal',
        primaryUrl: 'https://spambot.com',
        description: 'Spam description text here.',
        categoryId: starterCategoryId,
        honeypot: 'I am a bot filling hidden fields',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body.error)).toContain('Spam detected');
    });

    it('rejects registration with invalid URL format', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/registrations').send({
        applicantName: 'Legit User',
        applicantEmail: 'user@legit.com',
        websiteName: 'Legit Portal',
        primaryUrl: 'not_a_valid_url',
        description: 'Valid description text here for test.',
        categoryId: starterCategoryId,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('successfully submits valid registration request with PENDING status', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/registrations')
        .send({
          applicantName: 'Taro Yamada',
          applicantEmail: testApplicantEmail,
          applicantPhone: '+1234567890',
          country: 'Japan',
          telegramOrDiscord: '@taro_yamada',
          websiteName: testWebsiteName,
          primaryUrl: testPrimaryUrl,
          description: 'A curated anime discovery platform with fast mirrors.',
          categoryId: starterCategoryId,
          proposedTags: ['Anime', 'Streaming', 'HD'],
          contentRating: 'ALL',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.applicantEmail).toBe(testApplicantEmail);

      registrationRequestId = res.body.data.id;
    });

    it('detects duplicate submission from same applicant email while PENDING', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/registrations').send({
        applicantName: 'Duplicate Taro',
        applicantEmail: testApplicantEmail,
        websiteName: 'Another Name',
        primaryUrl: 'https://different-url.com',
        description: 'Another website attempt description.',
        categoryId: starterCategoryId,
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already under review');
    });
  });

  // ===========================================================================
  // 3. ADMIN REVIEW & APPROVAL TRANSACTION
  // ===========================================================================
  describe('3. Admin Review & Atomic Approval Transaction', () => {
    it('Admin lists registration requests with filter', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/registrations?status=PENDING')
        .set('Authorization', `Bearer ${superAdminAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      const found = res.body.data.items.find((r: any) => r.id === registrationRequestId);
      expect(found).toBeDefined();
    });

    it('POST /api/v1/registrations/:id/approve - executes atomic approval transaction', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/registrations/${registrationRequestId}/approve`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.website).toBeDefined();
      expect(res.body.data.domain).toBeDefined();
      expect(res.body.data.rawInviteToken).toBeDefined();

      createdWebsiteId = res.body.data.website.id;
      createdDomainId = res.body.data.domain.id;
      rawInviteToken = res.body.data.rawInviteToken;

      // Verify DB state: Registration is APPROVED
      const updatedReg = await prisma.registrationRequest.findUnique({
        where: { id: registrationRequestId },
      });
      expect(updatedReg?.status).toBe('APPROVED');
      expect(updatedReg?.resultingWebsiteId).toBe(createdWebsiteId);

      // Verify DB state: Website created with status ACTIVE
      const website = await prisma.website.findUnique({
        where: { id: createdWebsiteId },
      });
      expect(website?.status).toBe('ACTIVE');

      // Verify DB state: Initial primary domain created
      const domain = await prisma.domain.findUnique({
        where: { id: createdDomainId },
      });
      expect(domain?.type).toBe('PRIMARY');
      expect(domain?.status).toBe('ACTIVE');

      // Verify DB state: Single-use 24h InviteToken created for the user
      const inviteToken = await prisma.token.findFirst({
        where: { type: 'INVITE', userId: res.body.data.userId },
      });
      expect(inviteToken).toBeDefined();
      expect(inviteToken?.usedAt).toBeNull();
    });

    it('cannot approve an already approved registration request', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/registrations/${registrationRequestId}/approve`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Cannot approve');
    });
  });

  // ===========================================================================
  // 4. OWNER CREDENTIAL SETUP & AUTHENTICATION
  // ===========================================================================
  describe('4. Owner Credential Setup & Authentication', () => {
    it('Applicant uses 24h invite token to activate account and set password', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/auth/accept-invite').send({
        token: rawInviteToken,
        password: 'OwnerSecurePassword2026!',
        confirmPassword: 'OwnerSecurePassword2026!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.status).toBe('ACTIVE');
    });

    it('Owner logs in and receives access token', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
        email: testApplicantEmail,
        password: 'OwnerSecurePassword2026!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();

      ownerAccessToken = res.body.data.accessToken;
    });

    it('Owner accesses their assigned website (1 owner = 1 website)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/websites/my-website')
        .set('Authorization', `Bearer ${ownerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdWebsiteId);
      expect(res.body.data.name).toBe(testWebsiteName);
      expect(res.body.data.domains.length).toBe(1);
    });

    it('Owner updates website profile (tagline and description)', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/websites/my-website')
        .set('Authorization', `Bearer ${ownerAccessToken}`)
        .send({
          tagline: 'The fastest anime mirrors in the world',
          description: 'Updated markdown description with full details and verified links.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tagline).toBe('The fastest anime mirrors in the world');
    });
  });

  // ===========================================================================
  // 5. DOMAIN & MIRROR MANAGEMENT (SINGLE & BULK)
  // ===========================================================================
  describe('5. Domain & Mirror Management', () => {
    let secondDomainId: string;

    it('Owner adds a single mirror domain', async () => {
      const mirrorHost = `mirror1-${randomUUID().slice(0, 8)}.fun`;
      const res = await request(app.getHttpServer())
        .post(`/api/v1/domains/website/${createdWebsiteId}`)
        .set('Authorization', `Bearer ${ownerAccessToken}`)
        .send({
          url: `https://${mirrorHost}`,
          label: 'US East Mirror',
          type: 'MIRROR',
          sortOrder: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hostname).toBe(mirrorHost);
      expect(res.body.data.label).toBe('US East Mirror');

      secondDomainId = res.body.data.id;
    });

    it('Owner bulk-adds multiple mirror domains with validation & deduplication', async () => {
      const mirror2 = `mirror2-${randomUUID().slice(0, 8)}.fun`;
      const mirror3 = `mirror3-${randomUUID().slice(0, 8)}.fun`;

      const res = await request(app.getHttpServer())
        .post(`/api/v1/domains/website/${createdWebsiteId}/bulk`)
        .set('Authorization', `Bearer ${ownerAccessToken}`)
        .send({
          domains: [
            { url: `https://${mirror2}`, label: 'EU Central Mirror', type: 'MIRROR' },
            { url: `https://${mirror3}`, label: 'Asia East Mirror', type: 'MIRROR' },
            // Intentional intra-batch duplicate
            { url: `https://${mirror2}`, label: 'Duplicate Entry', type: 'MIRROR' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.addedCount).toBe(2);
      expect(res.body.data.skippedCount).toBe(1);
      expect(res.body.data.skippedReasons[0].reason).toMatch(
        /Duplicate hostname|already registered/,
      );
    });

    it('IDOR defense: another user cannot manage domains of this website', async () => {
      // Create another user
      const anotherRole = await prisma.role.findUnique({ where: { name: 'Website Owner' } });
      const anotherUser = await prisma.user.create({
        data: {
          email: `other_owner_${randomUUID().slice(0, 6)}@test.com`,
          name: 'Other Owner',
          passwordHash: 'dummy',
          roleId: anotherRole!.id,
          status: 'ACTIVE',
        },
      });

      const jwtService = app.get(require('@nestjs/jwt').JwtService);
      const anotherToken = jwtService.sign({
        sub: anotherUser.id,
        email: anotherUser.email,
        role: 'Website Owner',
        roleType: 'WEBSITE_OWNER',
        permissions: ['domain.create'],
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/domains/website/${createdWebsiteId}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({
          url: 'https://hacked-domain.com',
          label: 'Hacker Mirror',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('do not have permission');
    });

    it('Owner reorders domains sort priority', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/domains/website/${createdWebsiteId}/reorder`)
        .set('Authorization', `Bearer ${ownerAccessToken}`)
        .send({
          items: [
            { id: secondDomainId, sortOrder: 0 },
            { id: createdDomainId, sortOrder: 1 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ===========================================================================
  // 6. PUBLIC DIRECTORY LISTING & EVERYTHINGMOE-STYLE DIRECTORY
  // ===========================================================================
  describe('6. Public Directory Views & Search', () => {
    it('GET /api/v1/websites - public directory search finds the newly approved website', async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/v1/websites?search=${encodeURIComponent(testWebsiteName)}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.items[0].name).toBe(testWebsiteName);
      expect(res.body.data.items[0].domains.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/websites/grouped - returns directory grouped by category with mirrors', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/websites/grouped');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const categoryGroup = res.body.data.find((g: any) => g.category.id === starterCategoryId);
      expect(categoryGroup).toBeDefined();
      const websiteInGroup = categoryGroup.websites.find((w: any) => w.id === createdWebsiteId);
      expect(websiteInGroup).toBeDefined();
    });

    it('GET /api/v1/websites/by-slug/:slug - increments view count', async () => {
      const site = await prisma.website.findUnique({ where: { id: createdWebsiteId } });
      const initialViews = site!.viewCount;

      const res = await request(app.getHttpServer()).get(`/api/v1/websites/by-slug/${site!.slug}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.viewCount).toBe(initialViews + 1);
    });

    it('POST /api/v1/domains/:id/click - tracks outbound link click', async () => {
      const res = await request(app.getHttpServer()).post(
        `/api/v1/domains/${createdDomainId}/click`,
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const domain = await prisma.domain.findUnique({ where: { id: createdDomainId } });
      expect(domain?.clickCount).toBe(1);
    });
  });

  // ===========================================================================
  // 7. REPORTS & MODERATION
  // ===========================================================================
  describe('7. Reports & Moderation Subsystem', () => {
    let reportId: string;

    it('Public visitor submits broken link report', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/reports').send({
        websiteId: createdWebsiteId,
        domainId: createdDomainId,
        reason: 'BROKEN_LINK',
        details: 'Getting Cloudflare Error 521 Web server is down.',
        reporterEmail: 'visitor@singapore.sg',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');

      reportId = res.body.data.id;
    });

    it('Admin views reports and updates status to RESOLVED', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${superAdminAccessToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.items.length).toBeGreaterThan(0);

      const updateRes = await request(app.getHttpServer())
        .put(`/api/v1/reports/${reportId}/status`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send({ status: 'RESOLVED' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe('RESOLVED');
      expect(updateRes.body.data.handledBy.email).toBe('admin@findfunlinks.com');
    });
  });

  // ===========================================================================
  // 8. SSRF-SAFE HEALTH CHECK ENGINE
  // ===========================================================================
  describe('8. SSRF-Safe Health Check Engine', () => {
    it('SSRF blocker catches private IP addresses (127.0.0.1, 10.0.0.1, 192.168.1.1)', async () => {
      await expect(healthCheckService.verifySsrfSafe('localhost')).rejects.toThrow(
        /SSRF Protection/,
      );

      await expect(healthCheckService.verifySsrfSafe('127.0.0.1')).rejects.toThrow(
        /SSRF Protection/,
      );
    });

    it('Probing private URL returns error result without crashing', async () => {
      const probe = await healthCheckService.probeUrl('http://127.0.0.1:8080/internal');

      expect(probe.isUp).toBe(false);
      expect(probe.error).toContain('SSRF Protection');
    });
  });
});
