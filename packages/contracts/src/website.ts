import { z } from 'zod';
import { ContentRating } from './enums';
import { SafeUrlRegex, PaginationQuerySchema } from './common';

export const WebsiteCardSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  tagline: z.string().nullable().optional(),
  description: z.string(),
  logoUrl: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  categoryId: z.string().uuid(),
  categoryName: z.string(),
  categorySlug: z.string(),
  tags: z.array(z.object({ id: z.string().uuid(), name: z.string(), slug: z.string() })),
  language: z.string(),
  contentRating: z.nativeEnum(ContentRating),
  isFeatured: z.boolean(),
  viewCount: z.number().int(),
  stars: z.number().int().optional().default(0),
  sortOrder: z.number().int().optional().default(0),
  activeDomainsCount: z.number().int(),
  primaryDomainUrl: z.string().nullable().optional(),
  updatedAt: z.string(),
});
export type WebsiteCard = z.infer<typeof WebsiteCardSchema>;

export interface OwnerWebsiteDetails {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  categoryId: string;
  category?: { id: string; name: string; slug: string } | null;
  categoryName?: string;
  categorySlug?: string;
  tags?: Array<{ id: string; name: string; slug: string }>;
  language: string;
  contentRating: ContentRating;
  status: string;
  isFeatured: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  socialLinks?: Record<string, string> | null;
  viewCount: number;
  stars?: number;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export const UpdateWebsiteSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().min(20).max(5000).optional(),
  logoUrl: z.string().trim().regex(SafeUrlRegex).optional().nullable(),
  coverUrl: z.string().trim().regex(SafeUrlRegex).optional().nullable(),
  categoryId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).max(10).optional(),
  language: z.string().trim().min(2).max(10).optional(),
  contentRating: z.nativeEnum(ContentRating).optional(),
  seoTitle: z.string().trim().max(100).optional(),
  seoDescription: z.string().trim().max(300).optional(),
  socialLinks: z.record(z.string().url()).optional(),
  isFeatured: z.boolean().optional(),
});
export type UpdateWebsiteInput = z.infer<typeof UpdateWebsiteSchema>;

export const WebsiteFilterParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  categorySlug: z.string().optional(),
  tagSlug: z.string().optional(),
  sortBy: z.enum(['popular', 'newest', 'alphabetical']).optional(),
});
export type WebsiteFilterParams = z.infer<typeof WebsiteFilterParamsSchema>;

export const PublicWebsitesQuerySchema = PaginationQuerySchema.extend({
  category: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  sort: z
    .enum(['popular', 'newest', 'recently_verified', 'alpha', 'most_starred'])
    .default('popular'),
  rating: z.nativeEnum(ContentRating).optional(),
});
export type PublicWebsitesQuery = z.infer<typeof PublicWebsitesQuerySchema>;

export const MirrorPreviewItemSchema = z.object({
  id: z.string().uuid(),
  label: z.string().nullable().optional(),
  url: z.string(),
  type: z.string(),
  status: z.string(),
  responseMs: z.number().nullable().optional(),
});
export type MirrorPreviewItem = z.infer<typeof MirrorPreviewItemSchema>;

export const WebsitePreviewSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  faviconUrl: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  highlights: z.array(z.string()).default([]),
  note: z.string().nullable().optional(),
  category: z.object({
    id: z.string().uuid(),
    slug: z.string(),
    name: z.string(),
    accentKey: z.string().optional(),
  }),
  rankInCategory: z.number().int(),
  starCount: z.number().int(),
  domainsCount: z.number().int(),
  onlineCount: z.number().int(),
  fastestMirror: z
    .object({
      url: z.string(),
      ms: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
  mirrors: z.array(MirrorPreviewItemSchema).default([]),
  lastVerifiedAt: z.string().nullable().optional(),
  tags: z
    .array(z.object({ id: z.string().uuid(), name: z.string(), slug: z.string() }))
    .default([]),
  isNew: z.boolean().default(false),
});
export type WebsitePreview = z.infer<typeof WebsitePreviewSchema>;

export const WebsiteScreenshotItemSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
  altText: z.string(),
  sortOrder: z.number().int().default(0),
});
export type WebsiteScreenshotItem = z.infer<typeof WebsiteScreenshotItemSchema>;

export const WebsiteDetailSchema = WebsitePreviewSchema.extend({
  description: z.string(),
  allHighlights: z.array(z.string()).default([]),
  screenshots: z.array(WebsiteScreenshotItemSchema).default([]),
  stats: z.object({
    clicks30d: z.number().int().default(0),
    uptime30d: z.number().default(100),
    addedAt: z.string(),
    language: z.string(),
    contentRating: z.string(),
  }),
  related: z.array(WebsitePreviewSchema).default([]),
});
export type WebsiteDetail = z.infer<typeof WebsiteDetailSchema>;

export const EngagementSchema = z.object({
  starCount: z.number().int(),
  starred: z.boolean(),
});
export type Engagement = z.infer<typeof EngagementSchema>;
