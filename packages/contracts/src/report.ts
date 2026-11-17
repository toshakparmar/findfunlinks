import { z } from 'zod';
import { ReportStatus } from './enums';

export const SubmitReportSchema = z.object({
  websiteId: z.string().uuid().optional(),
  domainId: z.string().uuid().optional(),
  reason: z.enum([
    'BROKEN_LINK',
    'MALICIOUS_PHISHING',
    'INCORRECT_METADATA',
    'DMCA_COPYRIGHT',
    'INAPPROPRIATE_CONTENT',
    'OTHER',
  ]),
  details: z.string().trim().min(5, 'Please provide more details').max(1000),
  reporterEmail: z.string().trim().email().optional(),
  honeypot: z.string().max(0).optional(),
});
export type SubmitReportInput = z.infer<typeof SubmitReportSchema>;

export const ReportItemSchema = z.object({
  id: z.string().uuid(),
  websiteId: z.string().uuid().nullable().optional(),
  domainId: z.string().uuid().nullable().optional(),
  reason: z.string(),
  details: z.string(),
  reporterEmail: z.string().nullable().optional(),
  status: z.nativeEnum(ReportStatus),
  handledById: z.string().uuid().nullable().optional(),
  createdAt: z.string(),
});
export type ReportItem = z.infer<typeof ReportItemSchema>;

export const CreateReportSchema = SubmitReportSchema;
export type CreateReportInput = SubmitReportInput;
