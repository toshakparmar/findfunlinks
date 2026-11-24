'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '../../../lib/api';
import type { RegistrationRequestDetails } from '@finallinks/api-client';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { CircularLoader } from '@/components/ui/CircularLoader';

function StatusContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const initialEmail = searchParams.get('email') || '';

  const [refInput, setRefInput] = useState(initialRef);
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState<RegistrationRequestDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Resubmit form state for CHANGES_REQUESTED
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [updatedProof, setUpdatedProof] = useState('');
  const [updatedUrl, setUpdatedUrl] = useState('');
  const [updatedNote, setUpdatedNote] = useState('');

  const fetchStatus = async (ref: string, email: string) => {
    if (!ref.trim() || !email.trim()) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.public.getRegistrationStatus(ref.trim(), email.trim());
      setRequestData(res);
      setUpdatedUrl(res.primaryUrl || '');
      setUpdatedProof(res.verificationProof || '');
      setUpdatedNote('');
    } catch (err: unknown) {
      setRequestData(null);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'No application found with this Reference ID and Email. Please double check your entries.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef && initialEmail) {
      fetchStatus(initialRef, initialEmail);
    }
  }, [initialRef, initialEmail]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim() || !emailInput.trim()) {
      toast.error('Please enter both your Reference ID and Email.');
      return;
    }
    fetchStatus(refInput, emailInput);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
    toast.success('Copied to clipboard');
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestData?.referenceId || !emailInput) return;
    try {
      setIsResubmitting(true);
      await api.public.resubmitRegistration({
        ref: requestData.referenceId,
        email: emailInput.toLowerCase().trim(),
        primaryUrl: updatedUrl.trim() || undefined,
        verificationProof: updatedProof.trim() || undefined,
        adminNote: updatedNote.trim() || undefined,
      });

      toast.success('Application updated! Our reviewers have been notified.');
      await fetchStatus(requestData.referenceId, emailInput);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update application.');
    } finally {
      setIsResubmitting(false);
    }
  };

  return (
    <div className="max-w-[1000px] w-full mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-fs-sm text-token/70 font-medium border-b border-token/10 pb-4">
        <Link href="/" className="hover:text-token transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4 text-token/40" />
        <Link href="/register" className="hover:text-token transition-colors">
          Register website
        </Link>
        <ChevronRight className="w-4 h-4 text-token/40" />
        <span className="text-token font-semibold">Check application status</span>
      </nav>

      {/* Search / Lookup Card */}
      <div className="bg-surface-1 border border-token/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-token tracking-tight leading-tight">
            Track website registration status
          </h1>
          <p className="text-fs-base text-token/70 mt-2 leading-relaxed">
            Enter the Reference ID generated when you submitted your website, along with your
            applicant email address.
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
        >
          <div className="sm:col-span-5 space-y-2">
            <label className="text-fs-sm font-semibold text-token">
              Reference ID <span className="text-hot">*</span>
            </label>
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value.toUpperCase())}
              placeholder="e.g. FL-2026-481920"
              className="w-full h-11 sm:h-12 px-4 py-3 rounded-xl text-fs-sm sm:text-fs-base font-mono bg-surface-2 border border-token/10 focus:border-primary focus:outline-none text-token placeholder:text-token/30 transition-colors uppercase"
            />
          </div>

          <div className="sm:col-span-5 space-y-2">
            <label className="text-fs-sm font-semibold text-token">
              Applicant email <span className="text-hot">*</span>
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="alex@yourdomain.com"
              className="w-full h-11 sm:h-12 px-4 py-3 rounded-xl text-fs-sm sm:text-fs-base bg-surface-2 border border-token/10 focus:border-primary focus:outline-none text-token placeholder:text-token/30 transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 sm:h-11 md:h-12 px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold bg-primary text-primary-fg hover:bg-primary/90 focus:outline-none disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <CircularLoader size="xs" color="#ffffff" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Lookup</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="bg-status-down/10 border border-status-down/20 rounded-xl p-4 text-fs-sm text-status-down flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Result Status Display */}
      {requestData && (
        <div className="bg-surface-1 border border-token/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Header & Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-token/10 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-display text-token">
                  {requestData.websiteName}
                </h2>
                <a
                  href={requestData.primaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                  title="Visit website"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-fs-sm text-token/60 mt-1 font-mono">
                Ref: <strong className="text-token">{requestData.referenceId}</strong> &bull;
                Submitted {new Date(requestData.submittedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Status Pill */}
            <div>
              {requestData.status === 'PENDING' && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-fs-sm font-semibold bg-accent/10 text-accent border border-accent/20">
                  <Clock className="w-4 h-4" />
                  Pending Review
                </span>
              )}

              {requestData.status === 'CHANGES_REQUESTED' && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-fs-sm font-semibold bg-hot/10 text-hot border border-hot/20 animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                  Changes Requested / Needs Info
                </span>
              )}

              {requestData.status === 'APPROVED' && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-fs-sm font-semibold bg-status-online/10 text-status-online border border-status-online/20">
                  <CheckCircle2 className="w-4 h-4" />
                  Approved & Listed
                </span>
              )}

              {requestData.status === 'REJECTED' && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-fs-sm font-semibold bg-status-down/10 text-status-down border border-status-down/20">
                  <XCircle className="w-4 h-4" />
                  Application Declined
                </span>
              )}
            </div>
          </div>

          {/* STATUS: PENDING DETAILS */}
          {requestData.status === 'PENDING' && (
            <div className="space-y-4">
              <div className="bg-surface-2 border border-token/10 rounded-xl p-5 space-y-2">
                <p className="text-fs-sm font-semibold text-token flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  Your application is in the curation queue
                </p>
                <p className="text-fs-sm text-token/70 leading-relaxed">
                  Our review team is currently verifying website performance, directory
                  categorization, and ownership. Normal turn-around time is{' '}
                  <strong className="text-token">2–3 business days</strong>. You will receive an email as soon as an
                  editorial decision is reached.
                </p>
              </div>

              {requestData.verificationToken && (
                <div className="bg-surface-2/40 border border-token/10 rounded-xl p-5 space-y-2.5">
                  <p className="text-fs-sm font-semibold text-token">
                    Verification Method: {requestData.verificationMethod}
                  </p>
                  <p className="text-fs-sm text-token/70">
                    Make sure your verification record or meta tag is active so our review check
                    succeeds:
                  </p>
                  <div className="flex items-center gap-2 bg-surface-1 border border-token/15 rounded-xl px-4 py-3 font-mono text-fs-sm text-primary">
                    <span className="flex-1 truncate">{requestData.verificationToken}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(requestData.verificationToken!)}
                      className="p-1 hover:text-token transition-colors"
                      title="Copy token"
                    >
                      {copiedToken ? (
                        <Check className="w-4 h-4 text-status-online" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATUS: CHANGES_REQUESTED (NEEDS INFO & RESUBMISSION) */}
          {requestData.status === 'CHANGES_REQUESTED' && (
            <div className="space-y-5">
              <div className="bg-hot/10 border border-hot/30 rounded-xl p-5 space-y-2.5">
                <p className="text-fs-sm font-bold text-hot flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Reviewer Feedback / Action Required
                </p>
                <p className="text-fs-sm text-token leading-relaxed font-medium bg-surface-1/60 p-4 rounded-xl border border-hot/20">
                  {requestData.reviewNote ||
                    'Please provide updated ownership verification proof or correct your primary URL.'}
                </p>
              </div>

              {/* Resubmission Form */}
              <form
                onSubmit={handleResubmit}
                className="border border-token/10 rounded-xl p-6 space-y-5 bg-surface-2/30"
              >
                <h3 className="text-fs-sm font-bold font-display uppercase tracking-wider text-token flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primary" />
                  Update details & resubmit for review
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-fs-sm font-semibold text-token">Primary URL</label>
                    <input
                      type="url"
                      value={updatedUrl}
                      onChange={(e) => setUpdatedUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-fs-sm bg-surface-1 border border-token/15 focus:border-primary focus:outline-none text-token"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-fs-sm font-semibold text-token">
                      Updated verification proof or details
                    </label>
                    <input
                      type="text"
                      value={updatedProof}
                      onChange={(e) => setUpdatedProof(e.target.value)}
                      placeholder="e.g. Added DNS TXT record or verified via official GitHub profile"
                      className="w-full px-4 py-2.5 rounded-xl text-fs-sm bg-surface-1 border border-token/15 focus:border-primary focus:outline-none text-token"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-fs-sm font-semibold text-token">Note to reviewers</label>
                    <textarea
                      rows={3}
                      value={updatedNote}
                      onChange={(e) => setUpdatedNote(e.target.value)}
                      placeholder="Explain the changes you made to address the feedback..."
                      className="w-full px-4 py-2.5 rounded-xl text-fs-sm bg-surface-1 border border-token/15 focus:border-primary focus:outline-none text-token"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResubmitting}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold bg-primary text-primary-fg hover:bg-primary/90 focus:outline-none disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  {isResubmitting ? (
                    <>
                      <CircularLoader size="xs" color="#ffffff" />
                      <span>Submitting update...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Resubmit Application</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STATUS: APPROVED */}
          {requestData.status === 'APPROVED' && (
            <div className="bg-status-online/10 border border-status-online/25 rounded-xl p-6 space-y-3">
              <p className="text-fs-base font-bold text-status-online flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Congratulations! Your application is approved.
              </p>
              <p className="text-fs-sm text-token/70 leading-relaxed">
                Your website is now active in the directory. An invite email was dispatched to{' '}
                <strong className="text-token">{emailInput}</strong> with a single-use setup link to
                establish your password.
              </p>
              <div className="pt-2">
                <a
                  href="http://localhost:3001/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-fs-sm font-bold bg-primary text-primary-fg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Log in to Owner Portal
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* STATUS: REJECTED */}
          {requestData.status === 'REJECTED' && (
            <div className="bg-status-down/10 border border-status-down/25 rounded-xl p-6 space-y-3">
              <p className="text-fs-base font-bold text-status-down flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Application not accepted
              </p>
              <p className="text-fs-sm text-token/70 leading-relaxed">Reason given by review team:</p>
              <div className="bg-surface-1/70 border border-status-down/20 rounded-xl p-4 text-fs-sm text-token font-medium">
                {requestData.reviewNote ||
                  'The submitted domain did not meet directory listing standards.'}
              </div>
              <p className="text-fs-sm text-token/60 pt-1">
                If your website changes or resolves these issues, you are welcome to submit a new
                application.
              </p>
            </div>
          )}

          {/* Details Summary Table */}
          <div className="border-t border-token/10 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-fs-sm">
            <div>
              <span className="text-token/50 block text-fs-xs">Applicant</span>
              <span className="font-semibold text-token">{requestData.applicantName}</span>
            </div>
            <div>
              <span className="text-token/50 block text-fs-xs">Role</span>
              <span className="font-semibold text-token">
                {requestData.applicantRole || 'Owner'}
              </span>
            </div>
            <div>
              <span className="text-token/50 block text-fs-xs">Primary Domain</span>
              <span className="font-semibold text-token font-mono truncate block">
                {requestData.primaryUrl}
              </span>
            </div>
            <div>
              <span className="text-token/50 block text-fs-xs">Mirrors Listed</span>
              <span className="font-semibold text-token">
                {requestData.additionalDomains?.length || 0} mirror(s)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[300px]">
          <CircularLoader size="md" label="Loading application status..." />
        </div>
      }
    >
      <StatusContent />
    </Suspense>
  );
}
