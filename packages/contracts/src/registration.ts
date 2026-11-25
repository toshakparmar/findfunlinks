import { z } from 'zod';
import { ContentRating, ApplicantRole, VerificationMethod } from './enums';
import { SafeUrlRegex } from './common';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'trashmail.com',
  'yopmail.com',
  'sharklasers.com',
  'throwawaymail.com',
  'getairmail.com',
  'dispostable.com',
  'temp-mail.org',
  'fakeinbox.com',
]);

export function isSafePublicUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const match = urlStr.trim().match(/^https?:\/\/([^/?#:]+)(?::\d+)?(?:\/.*)?$/i);
  if (!match || !match[1]) return false;

  if (urlStr.includes('@')) return false;

  const host = match[1].toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1') {
    return false;
  }
  if (
    host.startsWith('10.') ||
    host.startsWith('192.168.') ||
    host.startsWith('169.254.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
  ) {
    return false;
  }
  return true;
}

export function isNonDisposableEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[1]) return false;
  const domain = parts[1].toLowerCase().trim();
  return !DISPOSABLE_DOMAINS.has(domain);
}

export const SubmitRegistrationSchema = z.object({
  // 1. Applicant details
  applicantName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  applicantEmail: z
    .string()
    .trim()
    .email('Valid email address is required')
    .toLowerCase()
    .refine(isNonDisposableEmail, {
      message:
        'Disposable email addresses are not permitted. Please use your domain or personal email.',
    }),
  applicantPhone: z.string().trim().max(30).optional().or(z.literal('')),
  applicantRole: z
    .nativeEnum(ApplicantRole, {
      errorMap: () => ({
        message: 'Please select your role (Owner, Admin, Developer, or Representative)',
      }),
    })
    .default(ApplicantRole.OWNER),
  applicantCountry: z.string().trim().min(2).max(100).default('Global'),
  country: z.string().trim().optional(),
  telegramId: z.string().trim().max(100).optional(),
  telegramOrDiscord: z.string().trim().max(100).optional(),

  // 2. Website details
  websiteName: z
    .string()
    .trim()
    .min(2, 'Website name must be at least 2 characters')
    .max(100, 'Website name cannot exceed 100 characters'),
  primaryUrl: z
    .string()
    .trim()
    .regex(SafeUrlRegex, 'Valid HTTP/HTTPS URL required')
    .refine(isSafePublicUrl, {
      message: 'URL must be a public web domain (private IP ranges and localhost are blocked).',
    }),
  additionalDomains: z
    .array(
      z
        .string()
        .trim()
        .regex(SafeUrlRegex, 'Valid HTTP/HTTPS mirror URL required')
        .refine(isSafePublicUrl, { message: 'Mirror must be a public web domain.' }),
    )
    .max(4, 'Maximum 4 additional mirror domains allowed (5 total domains limit)')
    .default([]),
  categoryId: z.string().min(1, 'Valid category is required'),
  contentRating: z.nativeEnum(ContentRating).default(ContentRating.ALL),
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters explaining your website')
    .max(2000, 'Description cannot exceed 2000 characters'),
  logoUrl: z
    .string()
    .trim()
    .regex(SafeUrlRegex, 'Valid logo URL required')
    .refine(isSafePublicUrl, { message: 'Logo URL must be on a public domain.' })
    .optional()
    .or(z.literal('')),
  proposedTags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  language: z.string().trim().min(2).max(50).default('en'),
  contentLanguage: z.string().trim().min(2).max(50).optional(),

  // 3. Ownership verification
  verificationMethod: z
    .nativeEnum(VerificationMethod, {
      errorMap: () => ({ message: 'Please select an ownership verification method' }),
    })
    .default(VerificationMethod.DNS_TXT),
  verificationProof: z
    .string()
    .trim()
    .max(500, 'Verification proof cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),

  // 4. Admin notes & terms
  adminNote: z
    .string()
    .trim()
    .max(1000, 'Note to reviewers cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message:
      'You must agree to the Terms of Service and confirm you hold authority to register this website',
  }),

  // Bot & Security checks
  turnstileToken: z.string().optional(),
  honeypot: z.string().max(0, 'Spam detected').optional(),
});
export type SubmitRegistrationInput = z.infer<typeof SubmitRegistrationSchema>;

export const RegistrationSubmitSchema = SubmitRegistrationSchema;
export type RegistrationSubmitInput = SubmitRegistrationInput;

export const RegistrationStatusCheckSchema = z.object({
  ref: z.string().trim().min(4, 'Reference ID is required'),
  email: z.string().trim().email('Valid email address is required').toLowerCase(),
});
export type RegistrationStatusCheckInput = z.infer<typeof RegistrationStatusCheckSchema>;

export const ResubmitRegistrationSchema = z.object({
  ref: z.string().trim().optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  websiteName: z.string().trim().min(2).max(100).optional(),
  primaryUrl: z.string().trim().regex(SafeUrlRegex).refine(isSafePublicUrl).optional(),
  additionalDomains: z
    .array(z.string().trim().regex(SafeUrlRegex).refine(isSafePublicUrl))
    .max(4)
    .optional(),
  categoryId: z.string().optional(),
  contentRating: z.nativeEnum(ContentRating).optional(),
  description: z.string().trim().min(20).max(2000).optional(),
  logoUrl: z
    .string()
    .trim()
    .regex(SafeUrlRegex)
    .refine(isSafePublicUrl)
    .optional()
    .or(z.literal('')),
  proposedTags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
  applicantName: z.string().trim().min(2).max(100).optional(),
  applicantEmail: z.string().trim().email().toLowerCase().optional(),
  applicantPhone: z.string().trim().max(30).optional().or(z.literal('')),
  applicantRole: z.nativeEnum(ApplicantRole).optional(),
  verificationMethod: z.nativeEnum(VerificationMethod).optional(),
  verificationProof: z.string().trim().max(500).optional(),
  adminNote: z.string().trim().max(1000).optional(),
  language: z.string().optional(),
  country: z.string().optional(),
  telegramOrDiscord: z.string().optional(),
});
export type ResubmitRegistrationInput = z.infer<typeof ResubmitRegistrationSchema>;

export const ReviewRegistrationSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_CHANGES']),
  reviewNote: z.string().trim().max(1000).optional(),
  assignedRoleId: z.string().uuid().optional(),
});
export type ReviewRegistrationInput = z.infer<typeof ReviewRegistrationSchema>;
