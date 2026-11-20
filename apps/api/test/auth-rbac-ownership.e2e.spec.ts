import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { UserStatus, RoleType } from '@prisma/client';
import { ensureTestData } from './test-helper';

describe('Auth, RBAC & Ownership Security (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let superAdminAccessToken: string;
  let superAdminRefreshToken: string;

  let ownerUser: any;
  let ownerAccessToken: string;

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

    // Ensure database base fixtures exist
    const { ownerRole } = await ensureTestData(prisma);

    const ownerPasswordHash = await argon2.hash('OwnerSecurePassword2026!');
    ownerUser = await prisma.user.upsert({
      where: { email: 'owner_test@findfunlinks.com' },
      update: {
        passwordHash: ownerPasswordHash,
        status: UserStatus.ACTIVE,
        failedLoginCount: 0,
        lockedUntil: null,
      },
      create: {
        email: 'owner_test@findfunlinks.com',
        name: 'Test Owner',
        passwordHash: ownerPasswordHash,
        status: UserStatus.ACTIVE,
        roleId: ownerRole.id,
      },
    });
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  }, 30000);

  // ===========================================================================
  // 1. AUTHENTICATION & SESSIONS
  // ===========================================================================
  describe('1. Authentication Subsystem', () => {
    it('POST /api/v1/auth/login - authenticates Super Admin and sets httpOnly refresh cookie', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
        email: 'admin@findfunlinks.com',
        password: 'SuperAdminSecretPass123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@findfunlinks.com');
      expect(res.body.data.user.role.type).toBe('SUPER_ADMIN');

      // Verify Set-Cookie header contains refresh_token
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshCookie = (cookies as unknown as string[]).find((c) =>
        c.startsWith('refresh_token='),
      );
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');

      superAdminAccessToken = res.body.data.accessToken;
      // Extract token value
      const match = refreshCookie?.match(/refresh_token=([^;]+)/);
      superAdminRefreshToken = match ? match[1] : '';
    });

    it('POST /api/v1/auth/login - rejects invalid password with 401 and generic message', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
        email: 'admin@findfunlinks.com',
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('Account Lockout - triggers lockout after repeated failed attempts', async () => {
      // Create a throwaway user for lockout test
      const throwawayEmail = 'lockout_target@findfunlinks.com';
      const role = await prisma.role.findFirst();
      await prisma.user.upsert({
        where: { email: throwawayEmail },
        update: { failedLoginCount: 0, lockedUntil: null },
        create: {
          email: throwawayEmail,
          name: 'Lockout Target',
          passwordHash: await argon2.hash('CorrectPassword123!'),
          roleId: role!.id,
          status: UserStatus.ACTIVE,
        },
      });

      // Submit 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email: throwawayEmail, password: 'WrongPassword' });
      }

      // 6th attempt should return locked account
      const lockedRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: throwawayEmail, password: 'WrongPassword' });

      expect(lockedRes.status).toBe(401);
      expect(lockedRes.body.error.message).toContain('Account is temporarily locked');
    });

    it('POST /api/v1/auth/refresh - rotates refresh token and returns new access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refresh_token=${superAdminRefreshToken}`])
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();

      const cookies = res.headers['set-cookie'];
      const newRefreshCookie = (cookies as unknown as string[]).find((c) =>
        c.startsWith('refresh_token='),
      );
      expect(newRefreshCookie).toBeDefined();

      const match = newRefreshCookie?.match(/refresh_token=([^;]+)/);
      const newRefreshToken = match ? match[1] : '';
      expect(newRefreshToken).not.toBe(superAdminRefreshToken);

      // Refresh Reuse Detection: Presenting the old rotated token MUST be rejected and trigger revocation
      const reuseRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refresh_token=${superAdminRefreshToken}`])
        .send();

      expect(reuseRes.status).toBe(401);
      expect(reuseRes.body.error.message).toContain('Compromised session detected');
    });

    it('POST /api/v1/auth/accept-invite - accepts 24h expiring invite token and sets password', async () => {
      // Create an invited user
      const inviteEmail = 'invited_owner@findfunlinks.com';
      const role = await prisma.role.findUnique({ where: { name: 'Website Owner' } });
      const invitedUser = await prisma.user.upsert({
        where: { email: inviteEmail },
        update: { status: UserStatus.INVITED },
        create: {
          email: inviteEmail,
          name: 'Invited Owner',
          passwordHash: 'dummy',
          roleId: role!.id,
          status: UserStatus.INVITED,
        },
      });

      const rawInviteToken = `test_invite_${randomUUID()}`;
      const tokenHash = require('crypto').createHash('sha256').update(rawInviteToken).digest('hex');

      await prisma.token.create({
        data: {
          userId: invitedUser.id,
          tokenHash,
          type: 'INVITE',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        },
      });

      const res = await request(app.getHttpServer()).post('/api/v1/auth/accept-invite').send({
        token: rawInviteToken,
        password: 'StrongNewPassword123!',
        confirmPassword: 'StrongNewPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.status).toBe('ACTIVE');

      // Re-using the same invite token should fail
      const reuseInvite = await request(app.getHttpServer())
        .post('/api/v1/auth/accept-invite')
        .send({
          token: rawInviteToken,
          password: 'AnotherPassword123!',
          confirmPassword: 'AnotherPassword123!',
        });

      expect(reuseInvite.status).toBe(400);
    });
  });

  // ===========================================================================
  // 2. RBAC & PERMISSIONS GUARDS
  // ===========================================================================
  describe('2. Role-Based Access Control (RBAC)', () => {
    beforeAll(async () => {
      // Log in as Super Admin to get fresh token
      const adminLogin = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
        email: 'admin@findfunlinks.com',
        password: 'SuperAdminSecretPass123!',
      });
      superAdminAccessToken = adminLogin.body.data.accessToken;

      // Log in as Website Owner to get owner token
      const ownerLogin = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
        email: 'owner_test@findfunlinks.com',
        password: 'OwnerSecurePassword2026!',
      });
      ownerAccessToken = ownerLogin.body.data.accessToken;
    });

    it('Super Admin bypass - Super Admin can access guarded admin endpoints', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superAdminAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('RBAC Enforcement - Website Owner without user.view permission is blocked with 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${ownerAccessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Insufficient permissions');
    });

    it('System Roles Protection - Super Admin role permissions cannot be altered', async () => {
      const superAdminRole = await prisma.role.findUnique({
        where: { name: 'Super Admin' },
      });

      const res = await request(app.getHttpServer())
        .put(`/api/v1/admin/roles/${superAdminRole!.id}/permissions`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send({ permissions: [] });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('Super Admin permissions cannot be modified');
    });
  });

  // ===========================================================================
  // 3. OWNERSHIP SCOPING (IDOR DEFENSE)
  // ===========================================================================
  describe('3. Ownership Boundaries & IDOR Prevention', () => {
    let websiteA: any;
    let websiteB: any;
    let ownerB: any;

    beforeAll(async () => {
      const category = await prisma.category.findFirst();

      // Owner A website
      websiteA = await prisma.website.upsert({
        where: { slug: 'website-a-test' },
        update: {},
        create: {
          name: 'Website A',
          slug: 'website-a-test',
          description: 'Website A Description with plenty of words to pass validation.',
          categoryId: category!.id,
          ownerId: ownerUser.id,
        },
      });

      // Create Owner B and Website B
      const ownerRole = await prisma.role.findUnique({ where: { name: 'Website Owner' } });
      ownerB = await prisma.user.upsert({
        where: { email: 'owner_b@findfunlinks.com' },
        update: {},
        create: {
          email: 'owner_b@findfunlinks.com',
          name: 'Owner B',
          passwordHash: await argon2.hash('OwnerBPassword2026!'),
          roleId: ownerRole!.id,
          status: UserStatus.ACTIVE,
        },
      });

      websiteB = await prisma.website.upsert({
        where: { slug: 'website-b-test' },
        update: {},
        create: {
          name: 'Website B',
          slug: 'website-b-test',
          description: 'Website B Description with plenty of words to pass validation.',
          categoryId: category!.id,
          ownerId: ownerB.id,
        },
      });
    });

    it('One Owner = Exactly One Website is enforced at DB level (P2002 conflict)', async () => {
      const category = await prisma.category.findFirst();

      // Attempting to create a second website for ownerUser should throw unique constraint violation
      await expect(
        prisma.website.create({
          data: {
            name: 'Website A Duplicate',
            slug: 'website-a-duplicate',
            description: 'Duplicate website attempt description.',
            categoryId: category!.id,
            ownerId: ownerUser.id,
          },
        }),
      ).rejects.toThrow();
    });

    it('Global Hostname Uniqueness is enforced at DB level (no two websites can claim same hostname)', async () => {
      const testHost = `sharedmirror-${randomUUID().slice(0, 8)}.example.com`;
      await prisma.domain.create({
        data: {
          websiteId: websiteA.id,
          hostname: testHost,
          url: `https://${testHost}`,
        },
      });

      // Attempting to register the same hostname under Website B should fail
      await expect(
        prisma.domain.create({
          data: {
            websiteId: websiteB.id,
            hostname: testHost,
            url: `https://${testHost}`,
          },
        }),
      ).rejects.toThrow();
    });
  });

  // ===========================================================================
  // 4. VALIDATION & ERROR ENVELOPE
  // ===========================================================================
  describe('4. Standardized Response & Error Envelope', () => {
    it('Malformed input returns 400 Bad Request formatted with error envelope and requestId', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', '198.51.100.99')
        .send({
          email: 'not-an-email',
          password: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBeDefined();
      expect(res.body.requestId).toBeDefined();
    });

    it('Valid request returns success true with data wrapper and x-request-id header', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/health/live');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
      expect(res.headers['x-request-id']).toBeDefined();
    });
  });
});
