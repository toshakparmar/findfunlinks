'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { api, type RegistrationRequestDetails } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import { formatTimeAgo } from '../../lib/utils';
import {
  Search,
  Check,
  X,
  RotateCcw,
  ExternalLink,
  Globe,
  User,
  Loader2,
  Eye,
  Radio,
  Shield,
  Copy,
  CheckCircle2,
} from 'lucide-react';

interface ApprovalResult {
  message: string;
  userId?: string;
  websiteId?: string;
  tempPassword?: string;
  loginUrl?: string;
  inviteUrl?: string;
  rawInviteToken?: string;
  website?: { name: string; slug: string };
}

function RegistrationsContent() {
  const searchParams = useSearchParams();
  const highlightedId = searchParams.get('id');

  const [registrations, setRegistrations] = useState<RegistrationRequestDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Selected item for review modal
  const [selectedItem, setSelectedItem] = useState<RegistrationRequestDetails | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | null>(
    null,
  );
  const [actionNote, setActionNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [approvalResult, setApprovalResult] = useState<ApprovalResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getRegistrations({
        limit: 100,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setRegistrations(res.items || []);

      if (highlightedId && res.items) {
        const found = res.items.find((r) => r.id === highlightedId);
        if (found) setSelectedItem(found);
      }
    } catch {
      toast.error('Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      setSubmittingAction(true);
      const res = (await api.admin.approveRegistration(id)) as ApprovalResult;
      toast.success(
        'Registration approved! User, website & domains provisioned and invite email sent.',
      );
      setActionType(null);
      setSelectedItem(null);
      if (res?.rawInviteToken || res?.tempPassword) {
        setApprovalResult(res);
      }
      await fetchRegistrations();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Approval failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!actionNote.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    try {
      setSubmittingAction(true);
      await api.admin.rejectRegistration(id, actionNote.trim());
      toast.success('Application rejected and applicant notified.');
      setActionType(null);
      setActionNote('');
      setSelectedItem(null);
      await fetchRegistrations();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Rejection failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRequestChanges = async (id: string) => {
    if (!actionNote.trim()) {
      toast.error('Explanation note is required for requested changes.');
      return;
    }
    try {
      setSubmittingAction(true);
      await api.admin.requestChangesRegistration(id, actionNote.trim());
      toast.success('Changes requested! Resubmission link sent to applicant.');
      setActionType(null);
      setActionNote('');
      setSelectedItem(null);
      await fetchRegistrations();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const copyInviteUrl = (token: string) => {
    const ownerUrl = window.location.origin;
    const fullUrl = `${ownerUrl}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    toast.success('Owner invitation setup link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const copyPassword = (pwd: string) => {
    navigator.clipboard.writeText(pwd);
    setCopiedPassword(true);
    toast.success('Temporary password copied to clipboard!');
    setTimeout(() => setCopiedPassword(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">Registration Queue</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Review applicant identity, verify website URLs, and approve owner credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRegistrations}
          className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Approval Result Banner */}
      {approvalResult && (
        <div className="p-6 rounded-xl border border-emerald-500/30 bg-[#1E2024] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="font-semibold text-base text-[#F3F4F6]">
                Website Owner Provisioned
              </span>
            </div>
            <button
              type="button"
              onClick={() => setApprovalResult(null)}
              className="text-[#9CA3AF] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            The website and owner account have been created. Notification has been dispatched to the
            applicant. Credentials and access details are provided below:
          </p>

          {/* Temporary Password Card */}
          {approvalResult.tempPassword && (
            <div className="p-4 rounded-lg bg-[#26292F] border border-[#33373D] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Temporary Password (72h Expiration)
                </span>
                <span className="text-xs text-amber-400 font-medium">
                  Change required on first login
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={approvalResult.tempPassword}
                  className="flex-1 h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm font-mono font-bold text-emerald-400 select-all tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => copyPassword(approvalResult.tempPassword!)}
                  className="inline-flex items-center gap-2 px-4 h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shrink-0"
                >
                  {copiedPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedPassword ? 'Copied' : 'Copy Password'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Setup / Invite Link */}
          {approvalResult.rawInviteToken && (
            <div className="p-4 rounded-lg bg-[#26292F] border border-[#33373D] space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Direct Single-Use Setup Link
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/accept-invite?token=${approvalResult.rawInviteToken}`}
                  className="flex-1 h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm font-mono text-[#D1D5DB] select-all"
                />
                <button
                  type="button"
                  onClick={() => copyInviteUrl(approvalResult.rawInviteToken!)}
                  className="inline-flex items-center gap-2 px-4 h-11 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-white text-sm font-medium transition-colors shrink-0"
                >
                  {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['ALL', 'PENDING', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-4 h-11 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#0B9DF7] text-white'
                  : 'border border-[#33373D] bg-[#1E2024] text-[#9CA3AF] hover:bg-[#26292F] hover:text-white'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <Search className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRegistrations()}
            placeholder="Search applicant, site, or URL..."
            className="w-full h-11 rounded-lg border border-[#33373D] bg-[#1E2024] pl-10 pr-4 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#33373D] bg-[#1E2024] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-[#0B9DF7]" />
          </div>
        ) : registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#33373D] bg-[#16181B] text-[#9CA3AF]">
                  <th className="py-3 px-4 font-medium">Website</th>
                  <th className="py-3 px-4 font-medium">Applicant</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Submitted</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#33373D]">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-[#26292F] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#F3F4F6]">
                      <div className="flex items-center gap-2">
                        <span>{reg.websiteName}</span>
                        {reg.referenceId && (
                          <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#26292F] text-[#0B9DF7] border border-[#33373D]">
                            {reg.referenceId}
                          </span>
                        )}
                      </div>
                      <a
                        href={reg.primaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[#0B9DF7] hover:underline inline-flex items-center gap-1 truncate max-w-xs mt-1"
                      >
                        {reg.primaryUrl}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>

                    <td className="py-3.5 px-4 text-[#9CA3AF]">
                      <div className="font-medium text-[#F3F4F6] flex items-center gap-2">
                        <span>{reg.applicantName}</span>
                        {reg.applicantRole && (
                          <span className="text-[11px] font-medium text-[#9CA3AF] bg-[#26292F] px-1.5 py-0.5 rounded border border-[#33373D]">
                            {reg.applicantRole}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#9CA3AF] mt-0.5">{reg.applicantEmail}</div>
                      {reg.applicantCountry && (
                        <span className="text-xs text-[#6B7280]">{reg.applicantCountry}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={reg.status} />
                    </td>

                    <td className="py-3.5 px-4 text-[#9CA3AF] font-mono text-xs">
                      {formatTimeAgo(reg.submittedAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(reg)}
                        className="px-3.5 h-9 rounded-lg bg-[#26292F] text-[#F3F4F6] font-medium hover:bg-[#33373D] transition-colors inline-flex items-center gap-1.5 border border-[#33373D]"
                      >
                        <Eye className="h-4 w-4 text-[#0B9DF7]" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-[#9CA3AF]">
            No registration requests found matching current filter.
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-[#33373D] bg-[#1E2024] max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#33373D] pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-[#F3F4F6]">{selectedItem.websiteName}</h2>
                  <StatusBadge status={selectedItem.status} />
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-[#9CA3AF]">
                  <span>
                    Ref:{' '}
                    <strong className="text-[#F3F4F6] font-mono">
                      {selectedItem.referenceId || selectedItem.id.slice(0, 8)}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>Submitted {formatTimeAgo(selectedItem.submittedAt)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setActionType(null);
                }}
                className="p-2 rounded-lg border border-[#33373D] text-[#9CA3AF] hover:text-white hover:bg-[#26292F] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-sm">
              {/* Website Info Card */}
              <div className="p-4 rounded-xl bg-[#16181B] border border-[#33373D] space-y-3">
                <div className="flex items-center gap-2 font-semibold text-[#F3F4F6]">
                  <Globe className="h-4 w-4 text-[#0B9DF7]" />
                  <span>Website Specifications</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#9CA3AF]">Primary URL:</span>
                    <div className="font-mono text-[#F3F4F6] font-medium truncate mt-0.5">
                      <a
                        href={selectedItem.primaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0B9DF7] hover:underline"
                      >
                        {selectedItem.primaryUrl}
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF]">Content Rating:</span>
                    <div className="font-semibold text-[#F3F4F6] mt-0.5">
                      {selectedItem.contentRating}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-[#9CA3AF]">Description:</span>
                  <p className="text-xs text-[#D1D5DB] mt-1 leading-relaxed bg-[#1E2024] p-3 rounded-lg border border-[#33373D]">
                    {selectedItem.description}
                  </p>
                </div>

                {Array.isArray(selectedItem.proposedTags) &&
                  selectedItem.proposedTags.length > 0 && (
                    <div>
                      <span className="text-xs text-[#9CA3AF]">Proposed Tags:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(selectedItem.proposedTags as string[]).map((t: string) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-[#1E2024] text-[#D1D5DB] text-xs font-medium border border-[#33373D]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Applicant Card */}
              <div className="p-4 rounded-xl bg-[#16181B] border border-[#33373D] space-y-3">
                <div className="flex items-center gap-2 font-semibold text-[#F3F4F6]">
                  <User className="h-4 w-4 text-[#0B9DF7]" />
                  <span>Applicant Information</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#9CA3AF]">Full Name:</span>
                    <div className="font-medium text-[#F3F4F6] mt-0.5">
                      {selectedItem.applicantName}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF]">Email:</span>
                    <div className="font-mono text-[#F3F4F6] mt-0.5">
                      {selectedItem.applicantEmail}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF]">Country:</span>
                    <div className="text-[#F3F4F6] mt-0.5">
                      {selectedItem.applicantCountry || 'Global'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF]">Role:</span>
                    <div className="font-medium text-[#F3F4F6] mt-0.5">
                      {selectedItem.applicantRole || 'Owner'}
                    </div>
                  </div>
                  {selectedItem.applicantPhone && (
                    <div>
                      <span className="text-[#9CA3AF]">Phone:</span>
                      <div className="font-mono text-[#F3F4F6] mt-0.5">
                        {selectedItem.applicantPhone}
                      </div>
                    </div>
                  )}
                  {selectedItem.telegramOrDiscord && (
                    <div>
                      <span className="text-[#9CA3AF]">Discord / Telegram:</span>
                      <div className="font-mono text-[#F3F4F6] mt-0.5">
                        {selectedItem.telegramOrDiscord}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mirrors / Additional Domains */}
              {Array.isArray(selectedItem.additionalDomains) &&
                selectedItem.additionalDomains.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#16181B] border border-[#33373D] space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-[#F3F4F6]">
                      <Radio className="h-4 w-4 text-[#0B9DF7]" />
                      <span>Additional Mirrors ({selectedItem.additionalDomains.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {selectedItem.additionalDomains.map((m: string, i: number) => (
                        <div
                          key={i}
                          className="font-mono text-xs text-[#0B9DF7] bg-[#1E2024] p-2.5 rounded-lg border border-[#33373D]"
                        >
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Ownership Verification Proof */}
              <div className="p-4 rounded-xl bg-[#16181B] border border-[#33373D] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-[#F3F4F6]">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>Ownership Verification</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#9CA3AF]">Method:</span>
                    <div className="font-medium text-[#F3F4F6] mt-0.5">
                      {selectedItem.verificationMethod || 'DNS_TXT'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF]">Token:</span>
                    <div className="font-mono text-[#F3F4F6] text-xs truncate mt-0.5">
                      {selectedItem.verificationToken || 'N/A'}
                    </div>
                  </div>
                </div>
                {selectedItem.verificationProof && (
                  <div>
                    <span className="text-xs text-[#9CA3AF]">Proof Details / Notes:</span>
                    <p className="bg-[#1E2024] p-2.5 rounded-lg border border-[#33373D] text-[#F3F4F6] font-mono text-xs mt-1">
                      {selectedItem.verificationProof}
                    </p>
                  </div>
                )}
                {selectedItem.adminNote && (
                  <div>
                    <span className="text-xs text-[#9CA3AF]">Applicant Note to Reviewers:</span>
                    <p className="bg-[#1E2024] p-2.5 rounded-lg border border-[#33373D] text-[#D1D5DB] text-xs mt-1">
                      {selectedItem.adminNote}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Selection / Form */}
            {actionType ? (
              <div className="p-5 rounded-xl border border-[#33373D] bg-[#16181B] space-y-4">
                <div className="font-semibold text-[#F3F4F6] text-sm uppercase tracking-wider">
                  {actionType === 'APPROVE' && 'Confirm Approval'}
                  {actionType === 'REJECT' && 'Reject Application with Reason'}
                  {actionType === 'REQUEST_CHANGES' && 'Request Changes with Note'}
                </div>

                {actionType === 'APPROVE' && (
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">
                    Approving will automatically create the Website Owner account in{' '}
                    <strong className="text-[#F3F4F6]">ACTIVE</strong> status, create the{' '}
                    <strong className="text-[#F3F4F6]">ACTIVE</strong> website profile, register the
                    primary domain, generate a 72-hour temporary password, and email the
                    credentials.
                  </p>
                )}

                {(actionType === 'REJECT' || actionType === 'REQUEST_CHANGES') && (
                  <div>
                    <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
                      {actionType === 'REJECT'
                        ? 'Rejection Reason *'
                        : 'Instructions for Applicant *'}
                    </label>
                    <textarea
                      rows={3}
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder={
                        actionType === 'REJECT'
                          ? 'Explain why this submission does not meet directory guidelines...'
                          : 'Explain what fields or links need to be updated...'
                      }
                      className="w-full rounded-lg border border-[#33373D] bg-[#1E2024] p-3 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className="px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white"
                  >
                    Cancel
                  </button>

                  {actionType === 'APPROVE' && (
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => handleApprove(selectedItem.id)}
                      className="px-5 h-11 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-500 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {submittingAction && <Loader2 className="h-4 w-4 animate-spin" />}
                      Confirm & Approve
                    </button>
                  )}

                  {actionType === 'REJECT' && (
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => handleReject(selectedItem.id)}
                      className="px-5 h-11 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-500 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {submittingAction && <Loader2 className="h-4 w-4 animate-spin" />}
                      Send Rejection Email
                    </button>
                  )}

                  {actionType === 'REQUEST_CHANGES' && (
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => handleRequestChanges(selectedItem.id)}
                      className="px-5 h-11 rounded-lg bg-[#0B9DF7] text-white font-medium text-sm hover:bg-[#0987d6] disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {submittingAction && <Loader2 className="h-4 w-4 animate-spin" />}
                      Send Change Request Link
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#33373D]">
                <span className="text-sm text-[#9CA3AF]">Select an outcome:</span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActionType('REQUEST_CHANGES');
                      setActionNote('');
                    }}
                    className="px-4 h-11 rounded-lg border border-[#33373D] bg-[#26292F] text-[#0B9DF7] font-medium text-sm hover:bg-[#33373D] transition-colors"
                  >
                    Request Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionType('REJECT');
                      setActionNote('');
                    }}
                    className="px-4 h-11 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 font-medium text-sm hover:bg-red-500/20 transition-colors"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('APPROVE')}
                    className="px-5 h-11 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-500 transition-colors inline-flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Approve Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegistrationsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-[#9CA3AF]">
          Loading registration review queue...
        </div>
      }
    >
      <RegistrationsContent />
    </Suspense>
  );
}
