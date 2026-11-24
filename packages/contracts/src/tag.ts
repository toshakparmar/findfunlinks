import { z } from 'zod';
import { SlugRegex } from './common';

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(40),
  slug: z.string().trim().regex(SlugRegex),
  websiteCount: z.number().int().default(0).optional(),
});
export type Tag = z.infer<typeof TagSchema>;

export const CreateTagSchema = z.object({
  name: z.string().trim().min(2).max(40),
  slug: z.string().trim().regex(SlugRegex).optional(),
});
export type CreateTagInput = z.infer<typeof CreateTagSchema>;

export const UpdateTagSchema = CreateTagSchema.partial();
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;
