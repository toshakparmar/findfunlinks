import { z } from 'zod';
import { ContentRating } from './enums';
import { SafeUrlRegex } from './common';

export const SubmitRegistrationSchema = z.object({
  // Applicant details
  applicantName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  applicantEmail: z.string().trim().email('Valid email address is required').toLowerCase(),
  applicantPhone: z.string().trim().max(30).optional(),
  applicantCountry: z.string().trim().min(2).max(100),
  telegramOrDiscord: z.string().trim().max(100).optional(),

  // Website details
  websiteName: z.string().trim().min(2, 'Website name must be at least 2 characters').max(100),
  primaryUrl: z.string().trim().regex(SafeUrlRegex, 'Valid HTTP/HTTPS URL required'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(2000),
  categoryId: z.string().uuid('Valid category is required'),
  proposedTags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  logoUrl: z.string().trim().regex(SafeUrlRegex, 'Valid logo URL required').optional(),
  language: z.string().trim().min(2).max(10).default('en'),
  contentRating: z.nativeEnum(ContentRating).default(ContentRating.ALL),

  // Bot & Security checks
  turnstileToken: z.string().optional(),
  honeypot: z.string().max(0, 'Spam detected').optional(),
});
export type SubmitRegistrationInput = z.infer<typeof SubmitRegistrationSchema>;

export const ReviewRegistrationSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_CHANGES']),
  reviewNote: z.string().trim().max(1000).optional(),
  assignedRoleId: z.string().uuid().optional(),
});
export type ReviewRegistrationInput = z.infer<typeof ReviewRegistrationSchema>;

export const ResubmitRegistrationSchema = SubmitRegistrationSchema.omit({
  turnstileToken: true,
  honeypot: true,
});
export type ResubmitRegistrationInput = z.infer<typeof ResubmitRegistrationSchema>;
