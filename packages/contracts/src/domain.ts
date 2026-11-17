import { z } from 'zod';
import { DomainType, DomainStatus } from './enums';
import { SafeUrlRegex } from './common';

export const DomainItemSchema = z.object({
  id: z.string().uuid(),
  websiteId: z.string().uuid(),
  hostname: z.string(),
  url: z.string(),
  label: z.string().nullable().optional(),
  type: z.nativeEnum(DomainType),
  status: z.nativeEnum(DomainStatus),
  sortOrder: z.number().int(),
  lastCheckedAt: z.string().nullable().optional(),
  lastResponseMs: z.number().int().nullable().optional(),
  lastStatusCode: z.number().int().nullable().optional(),
  consecutiveFailures: z.number().int().default(0),
  isPublic: z.boolean(),
  clickCount: z.number().int().default(0),
});
export type DomainItem = z.infer<typeof DomainItemSchema>;

export const CreateDomainSchema = z.object({
  url: z.string().trim().regex(SafeUrlRegex, 'Valid HTTP/HTTPS URL required'),
  label: z.string().trim().max(50).optional(),
  type: z.nativeEnum(DomainType).default(DomainType.MIRROR),
  sortOrder: z.number().int().optional(),
  isPublic: z.boolean().default(true),
});
export type CreateDomainInput = z.infer<typeof CreateDomainSchema>;

export const BulkCreateDomainsSchema = z.object({
  rawLines: z.string().optional(),
  domains: z
    .array(
      z.object({
        url: z.string(),
        label: z.string().optional(),
        type: z.nativeEnum(DomainType).optional(),
        isPublic: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .optional(),
  defaultType: z.nativeEnum(DomainType).default(DomainType.MIRROR),
  isPublic: z.boolean().default(true),
});
export type BulkCreateDomainsInput = z.infer<typeof BulkCreateDomainsSchema>;

export const BulkCreateDomainSchema = BulkCreateDomainsSchema;
export type BulkCreateDomainInput = BulkCreateDomainsInput;

export const ReorderDomainsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
    }),
  ),
});
export type ReorderDomainsInput = z.infer<typeof ReorderDomainsSchema>;

export const UpdateDomainSchema = z.object({
  url: z.string().trim().optional(),
  label: z.string().trim().max(50).optional().nullable(),
  type: z.nativeEnum(DomainType).optional(),
  sortOrder: z.number().int().optional(),
  status: z.nativeEnum(DomainStatus).optional(),
  isPublic: z.boolean().optional(),
});
export type UpdateDomainInput = z.infer<typeof UpdateDomainSchema>;
