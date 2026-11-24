'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { ReportReason } from '@finallinks/contracts';
import { AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { CustomSelect } from './ui/CustomSelect';
import { CircularLoader } from './ui/CircularLoader';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  websiteId?: string;
  websiteName?: string;
  domainId?: string;
  domainHostname?: string;
}

export function ReportModal({
  isOpen,
  onClose,
  websiteId,
  websiteName,
  domainId,
  domainHostname,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('BROKEN_LINK');
  const [details, setDetails] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      toast.error('Please provide some details about the issue.');
      return;
    }

    try {
      setSubmitting(true);
      await api.public.submitReport({
        websiteId,
        domainId,
        reason,
        details: details.trim(),
        reporterEmail: reporterEmail.trim() || undefined,
      });
      setSubmitted(true);
      toast.success('Report submitted. Thank you for keeping the directory clean!');
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to submit report. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <AlertCircle className="h-5 w-5 text-brand-flame-500" />
            <span>Report an Issue</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-foreground">Report Received</h3>
            <p className="text-sm text-muted-foreground">
              Our moderation team reviews every report. Thank you for helping keep FinalLinks
              reliable.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {websiteName && (
              <div className="text-xs bg-muted/50 p-2.5 rounded-lg border border-border/60">
                Reporting on: <strong className="text-foreground">{websiteName}</strong>
                {domainHostname && (
                  <span className="text-muted-foreground"> ({domainHostname})</span>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="report-reason"
                className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5"
              >
                Issue Category
              </label>
              <CustomSelect
                id="report-reason"
                value={reason}
                onChange={(val) => setReason(val as ReportReason)}
                options={[
                  { value: 'BROKEN_LINK', label: 'Dead / Broken Mirror Link' },
                  { value: 'MALICIOUS_PHISHING', label: 'Malware, Phishing, or Scam' },
                  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate / Explicit Content' },
                  { value: 'INCORRECT_METADATA', label: 'Incorrect Information or Metadata' },
                  { value: 'DMCA_COPYRIGHT', label: 'Copyright / DMCA Takedown' },
                  { value: 'OTHER', label: 'Other Issue' },
                ]}
              />
            </div>

            <div>
              <label
                htmlFor="report-details"
                className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
              >
                Details & Description *
              </label>
              <textarea
                id="report-details"
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what went wrong or why this domain/listing is broken..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="report-email"
                className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
              >
                Your Email (Optional, for status updates)
              </label>
              <input
                id="report-email"
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-flame-600 text-xs font-semibold text-white hover:bg-brand-flame-700 transition-colors disabled:opacity-50"
              >
                {submitting && <CircularLoader size="xs" color="#ffffff" />}
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
