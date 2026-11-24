import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebsitesService } from '../src/modules/websites/websites.service';
import { VoterIdentityService } from '../src/modules/websites/voter-identity.service';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DomainType, DomainStatus, WebsiteStatus } from '@prisma/client';

describe('Showcase Upgrade - Phase 1 Data & API Test Suite', () => {
  let websitesService: WebsitesService;
  let voterIdentityService: VoterIdentityService;
  let mockPrisma: any;
  let mockConfig: any;

  const mockWebsite = {
    id: 'w-101',
    name: 'Showcase Portal',
    slug: 'showcase-portal',
    tagline: 'High speed anime & entertainment index',
    shortDescription: 'High speed anime & entertainment index with instant mirrors',
    description: '## Full About\nDetailed markdown description of the website.',
    highlights: [
      'Zero popups or redirects',
      '4K streaming available',
      'Hourly mirror updates',
      'Community curated',
    ],
    note: 'Active community Discord available for link updates.',
    logoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=128',
    coverUrl: null,
    ownerId: 'owner-42',
    categoryId: 'cat-anime',
    status: WebsiteStatus.ACTIVE,
    isFeatured: true,
    viewCount: 1540,
    starCount: 42,
    stars: 42,
    sortOrder: 1,
    language: 'en',
    contentRating: 'ALL',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    category: {
      id: 'cat-anime',
      name: 'Anime & Manga',
      slug: 'anime',
    },
    tags: [
      { tag: { id: 'tag-1', name: 'Fast', slug: 'fast' } },
      { tag: { id: 'tag-2', name: 'HD', slug: 'hd' } },
    ],
    domains: [
      {
        id: 'd-1',
        hostname: 'mirror-fast.showcase.org',
        url: 'https://mirror-fast.showcase.org',
        label: 'Fast US',
        type: DomainType.MIRROR,
        status: DomainStatus.ACTIVE,
        sortOrder: 1,
        lastResponseMs: 85,
        lastCheckedAt: new Date(),
        isPublic: true,
      },
      {
        id: 'd-0',
        hostname: 'showcase.org',
        url: 'https://showcase.org',
        label: 'Primary',
        type: DomainType.PRIMARY,
        status: DomainStatus.ACTIVE,
        sortOrder: 0,
        lastResponseMs: 120,
        lastCheckedAt: new Date(),
        isPublic: true,
      },
      {
        id: 'd-2',
        hostname: 'proxy-eu.showcase.org',
        url: 'https://proxy-eu.showcase.org',
        label: 'EU Proxy',
        type: DomainType.PROXY,
        status: DomainStatus.DOWN,
        sortOrder: 2,
        lastResponseMs: 999,
        lastCheckedAt: new Date(),
        isPublic: true,
      },
    ],
    screenshots: [
      {
        id: 's-1',
        url: 'https://images.unsplash.com/photo-screenshot-1.jpg',
        thumbnailUrl: 'https://images.unsplash.com/photo-thumb-1.jpg',
        altText: 'Home screen',
        sortOrder: 0,
      },
    ],
  };

  beforeEach(() => {
    mockPrisma = {
      website: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
      slugRedirect: {
        findUnique: vi.fn(),
      },
      websiteStar: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockConfig = {
      get: vi.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'unit_test_secret_32_characters_long_val';
        if (key === 'NODE_ENV') return 'test';
        return null;
      }),
    };

    websitesService = new WebsitesService(mockPrisma as any, {} as any);
    voterIdentityService = new VoterIdentityService(mockConfig as any);
  });

  describe('VoterIdentityService', () => {
    it('creates a new voter identity when no cookie or header is present', () => {
      const mockReq: any = { cookies: {}, headers: {}, ip: '192.168.1.1' };
      const setCookies: any[] = [];
      const mockRes: any = {
        cookie: (name: string, val: string, opts: any) => {
          setCookies.push({ name, val, opts });
        },
      };

      const identity = voterIdentityService.getOrCreateVoterIdentity(mockReq, mockRes);

      expect(identity.voterId).toBeDefined();
      expect(identity.voterId.length).toBe(32); // 16 bytes hex
      expect(identity.voterHash).toBeDefined();
      expect(identity.voterHash.length).toBe(64); // SHA-256 hex
      expect(identity.ipHash).toBeDefined();
      expect(setCookies).toHaveLength(1);
      expect(setCookies[0].name).toBe('fl_voter');
      expect(setCookies[0].val).toBe(identity.voterId);
      expect(setCookies[0].opts.httpOnly).toBe(true);
    });

    it('reuses existing fl_voter cookie deterministically', () => {
      const existingId = 'abcdef1234567890abcdef1234567890';
      const mockReq: any = { cookies: { fl_voter: existingId }, headers: {}, ip: '10.0.0.1' };

      const id1 = voterIdentityService.getOrCreateVoterIdentity(mockReq);
      const id2 = voterIdentityService.getOrCreateVoterIdentity(mockReq);

      expect(id1.voterId).toBe(existingId);
      expect(id1.voterHash).toBe(id2.voterHash);
    });
  });

  describe('WebsitesService.getPreviewBySlug', () => {
    it('returns formatted preview data conforming to specification', async () => {
      mockPrisma.website.findUnique.mockResolvedValueOnce(mockWebsite);
      mockPrisma.website.count.mockResolvedValueOnce(0); // 0 websites ahead => rank 1

      const preview = await websitesService.getPreviewBySlug('showcase-portal');

      expect(preview.id).toBe('w-101');
      expect(preview.slug).toBe('showcase-portal');
      expect(preview.name).toBe('Showcase Portal');
      expect(preview.shortDescription).toBe(
        'High speed anime & entertainment index with instant mirrors',
      );
      expect(preview.highlights).toEqual(mockWebsite.highlights);
      expect(preview.rankInCategory).toBe(1);
      expect(preview.starCount).toBe(42);
      expect(preview.domainsCount).toBe(3);
      expect(preview.onlineCount).toBe(2); // 2 ACTIVE domains
      expect(preview.fastestMirror?.url).toBe('https://mirror-fast.showcase.org');
      expect(preview.fastestMirror?.ms).toBe(85);
      expect(preview.mirrors).toHaveLength(3);
      // Primary must come first regardless of sortOrder
      expect(preview.mirrors[0].type).toBe(DomainType.PRIMARY);

      // Verify payload is compact (< 6KB)
      const payloadSize = Buffer.byteLength(JSON.stringify(preview), 'utf8');
      expect(payloadSize).toBeLessThan(6000);
    });

    it('resolves renamed website via SlugRedirect 301 target', async () => {
      mockPrisma.website.findUnique.mockResolvedValueOnce(null);
      mockPrisma.slugRedirect.findUnique.mockResolvedValueOnce({
        oldSlug: 'old-name',
        website: mockWebsite,
      });
      mockPrisma.website.count.mockResolvedValueOnce(2);

      const preview = await websitesService.getPreviewBySlug('old-name');
      expect(preview.slug).toBe('showcase-portal');
      expect(preview.rankInCategory).toBe(3);
    });

    it('throws NotFoundException if website does not exist', async () => {
      mockPrisma.website.findUnique.mockResolvedValueOnce(null);
      mockPrisma.slugRedirect.findUnique.mockResolvedValueOnce(null);

      await expect(websitesService.getPreviewBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('WebsitesService.getDetailBySlug', () => {
    it('returns full detail including description, screenshots, stats, and related', async () => {
      mockPrisma.website.findUnique
        .mockResolvedValueOnce(mockWebsite) // for getPreviewBySlug
        .mockResolvedValueOnce(mockWebsite); // for detail full query
      mockPrisma.website.count.mockResolvedValueOnce(0);
      mockPrisma.website.findMany.mockResolvedValueOnce([]); // related

      const detail = await websitesService.getDetailBySlug('showcase-portal');

      expect(detail.description).toBe(mockWebsite.description);
      expect(detail.allHighlights).toEqual(mockWebsite.highlights);
      expect(detail.screenshots).toHaveLength(1);
      expect(detail.screenshots[0].altText).toBe('Home screen');
      expect(detail.stats.clicks30d).toBe(1540);
      expect(detail.stats.uptime30d).toBe(99.8);
      expect(detail.related).toBeDefined();
    });
  });

  describe('WebsitesService.toggleStar and Engagement', () => {
    const voterHash = 'voter_hash_abc_123';
    const ipHash = 'ip_hash_xyz_789';

    it('returns engagement status correctly for unstarred visitor', async () => {
      mockPrisma.website.findUnique.mockResolvedValueOnce({
        id: 'w-101',
        starCount: 42,
        stars: 42,
      });
      mockPrisma.websiteStar.findUnique.mockResolvedValueOnce(null);

      const engagement = await websitesService.getEngagement('showcase-portal', voterHash);
      expect(engagement.starCount).toBe(42);
      expect(engagement.starred).toBe(false);
    });

    it('blocks website owner from starring their own website', async () => {
      mockPrisma.website.findUnique.mockResolvedValueOnce({
        id: 'w-101',
        ownerId: 'owner-42',
        starCount: 42,
        stars: 42,
      });

      await expect(
        websitesService.toggleStar('showcase-portal', voterHash, ipHash, true, 'owner-42'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('adds a star idempotently (+1 per person)', async () => {
      mockPrisma.website.findUnique.mockResolvedValueOnce({
        id: 'w-101',
        ownerId: 'other-owner',
        starCount: 42,
        stars: 42,
      });
      mockPrisma.websiteStar.findUnique.mockResolvedValueOnce(null); // not starred yet
      mockPrisma.website.update.mockResolvedValueOnce({ starCount: 43 });

      const result = await websitesService.toggleStar('showcase-portal', voterHash, ipHash, true);

      expect(result.starred).toBe(true);
      expect(result.starCount).toBe(43);
      expect(mockPrisma.websiteStar.create).toHaveBeenCalledWith({
        data: {
          websiteId: 'w-101',
          voterHash,
          ipHash,
          status: 'VALID',
        },
      });
    });

    it('returns 200 without double counting when already starred (idempotent)', async () => {
      mockPrisma.website.findUnique.mockResolvedValueOnce({
        id: 'w-101',
        ownerId: 'other-owner',
        starCount: 43,
        stars: 43,
      });
      mockPrisma.websiteStar.findUnique.mockResolvedValueOnce({
        id: 'star-1',
        status: 'VALID',
      });

      const result = await websitesService.toggleStar('showcase-portal', voterHash, ipHash, true);

      expect(result.starred).toBe(true);
      expect(result.starCount).toBe(43);
      // create must NOT be called again
      expect(mockPrisma.websiteStar.create).not.toHaveBeenCalled();
      expect(mockPrisma.website.update).not.toHaveBeenCalled();
    });

    it('removes star on DELETE / unstar request', async () => {
      mockPrisma.website.findUnique.mockResolvedValueOnce({
        id: 'w-101',
        ownerId: 'other-owner',
        starCount: 43,
        stars: 43,
      });
      mockPrisma.websiteStar.findUnique.mockResolvedValueOnce({
        id: 'star-1',
        status: 'VALID',
      });
      mockPrisma.website.update.mockResolvedValueOnce({ starCount: 42 });

      const result = await websitesService.toggleStar('showcase-portal', voterHash, ipHash, false);

      expect(result.starred).toBe(false);
      expect(result.starCount).toBe(42);
      expect(mockPrisma.websiteStar.update).toHaveBeenCalledWith({
        where: { id: 'star-1' },
        data: { status: 'REMOVED' },
      });
    });
  });
});
