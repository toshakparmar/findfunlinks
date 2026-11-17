import { z } from 'zod';
import { SlugRegex } from './common';

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(50),
  slug: z.string().trim().regex(SlugRegex),
  description: z.string().trim().max(300).nullable().optional(),
  icon: z.string().trim().max(50).nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  websiteCount: z.number().int().default(0).optional(),
});
export type Category = z.infer<typeof CategorySchema>;

export const CreateCategorySchema = CategorySchema.pick({
  name: true,
  slug: true,
  description: true,
  icon: true,
  sortOrder: true,
  isActive: true,
});
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
