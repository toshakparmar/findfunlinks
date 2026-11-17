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
  activeDomainsCount: z.number().int(),
  primaryDomainUrl: z.string().nullable().optional(),
  updatedAt: z.string(),
});
export type WebsiteCard = z.infer<typeof WebsiteCardSchema>;

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
  sort: z.enum(['popular', 'newest', 'recently_verified', 'alpha']).default('popular'),
  rating: z.nativeEnum(ContentRating).optional(),
});
export type PublicWebsitesQuery = z.infer<typeof PublicWebsitesQuerySchema>;
