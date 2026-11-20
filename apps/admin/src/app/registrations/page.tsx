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
      if (res?.rawInviteToken) {
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
    const ownerUrl = window.location.origin.includes(':3001')
      ? window.location.origin.replace(':3001', ':3002')
      : window.location.origin;
    const fullUrl = `${ownerUrl}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    toast.success('Owner invitation setup link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">Registration Queue</h1>
          <p className="text-xs text-[#A8B3C7] mt-1">
            Review applicant identity, verify website URLs, and approve owner credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRegistrations}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Approval Result Banner Modal */}
      {approvalResult && (
        <div className="p-4 rounded-2xl border border-[#22C55E]/40 bg-[#22C55E]/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
              <span className="font-bold text-sm text-[#F1F5F9]">Website Owner Provisioned</span>
            </div>
            <button
              type="button"
              onClick={() => setApprovalResult(null)}
              className="text-[#A8B3C7] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-[#A8B3C7] leading-relaxed">
            The website and owner account have been created. An email invitation has been
            dispatched. You can also manually provide the 24-hour setup link below:
          </p>
          {approvalResult.rawInviteToken && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${typeof window !== 'undefined' ? (window.location.origin.includes(':3001') ? window.location.origin.replace(':3001', ':3002') : window.location.origin) : 'http://localhost:3002'}/accept-invite?token=${approvalResult.rawInviteToken}`}
                className="flex-1 rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs font-mono text-[#F1F5F9] select-all"
              />
              <button
                type="button"
                onClick={() => copyInviteUrl(approvalResult.rawInviteToken!)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shrink-0"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'PENDING', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'border border-[#1A2442] bg-[#0A1226] text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="h-4 w-4 text-[#6B7893] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRegistrations()}
            placeholder="Search applicant, site, or URL..."
            className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] pl-9 pr-3.5 py-2 text-xs text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1A2442] bg-[#0A1226] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          </div>
        ) : registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1A2442] bg-[#070D1E] text-[#A8B3C7]">
                  <th className="py-3 px-4 font-semibold">Website</th>
                  <th className="py-3 px-4 font-semibold">Applicant</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2442]/60">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-[#0E182F] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#F1F5F9]">
                      <div className="flex items-center gap-2">
                        <span>{reg.websiteName}</span>
                        {reg.referenceId && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#2563EB]/15 text-[#3B82F6] border border-[#2563EB]/30">
                            {reg.referenceId}
                          </span>
                        )}
                      </div>
                      <a
                        href={reg.primaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-[#3B82F6] hover:underline inline-flex items-center gap-1 truncate max-w-xs"
                      >
                        {reg.primaryUrl}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>

                    <td className="py-3.5 px-4 text-[#A8B3C7]">
                      <div className="font-medium text-[#F1F5F9] flex items-center gap-1.5">
                        <span>{reg.applicantName}</span>
                        {reg.applicantRole && (
                          <span className="text-[10px] font-semibold text-[#A8B3C7] bg-[#1A2442] px-1.5 py-0.2 rounded">
                            {reg.applicantRole}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px]">{reg.applicantEmail}</div>
                      {reg.applicantCountry && (
                        <span className="text-[10px] text-[#6B7893]">
                          📍 {reg.applicantCountry}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={reg.status} />
                    </td>

                    <td className="py-3.5 px-4 text-[#A8B3C7]">{formatTimeAgo(reg.submittedAt)}</td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(reg)}
                        className="px-3 py-1.5 rounded-lg bg-[#2563EB]/15 text-[#3B82F6] font-semibold hover:bg-[#2563EB] hover:text-white transition-colors inline-flex items-center gap-1 border border-[#2563EB]/30"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#A8B3C7]">
            No registration requests found matching current filter.
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-3xl border border-[#1A2442] bg-[#0A1226] max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#1A2442] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#F1F5F9]">{selectedItem.websiteName}</h2>
                  <StatusBadge status={selectedItem.status} />
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#A8B3C7]">
                  <span>
                    Ref:{' '}
                    <strong className="text-[#F1F5F9] font-mono">
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
                className="p-1.5 rounded-lg border border-[#1A2442] text-[#A8B3C7] hover:text-[#F1F5F9] hover:bg-[#0E182F] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              {/* Website Info Card */}
              <div className="p-4 rounded-2xl bg-[#070D1E] border border-[#1A2442] space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-[#F1F5F9] text-sm">
                  <Globe className="h-4 w-4 text-[#3B82F6]" />
                  <span>Website Specifications</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#A8B3C7]">Primary URL:</span>
                    <div className="font-mono text-[#F1F5F9] font-medium truncate">
                      <a
                        href={selectedItem.primaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3B82F6] hover:underline"
                      >
                        {selectedItem.primaryUrl}
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#A8B3C7]">Content Rating:</span>
                    <div className="font-semibold text-[#F1F5F9]">{selectedItem.contentRating}</div>
                  </div>
                </div>

                <div>
                  <span className="text-[#A8B3C7]">Description:</span>
                  <p className="text-[#F1F5F9] mt-0.5 leading-relaxed bg-[#050A18] p-2.5 rounded-lg border border-[#1A2442]">
                    {selectedItem.description}
                  </p>
                </div>

                {Array.isArray(selectedItem.proposedTags) &&
                  selectedItem.proposedTags.length > 0 && (
                    <div>
                      <span className="text-[#A8B3C7]">Proposed Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(selectedItem.proposedTags as string[]).map((t: string) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-[#050A18] text-[#F1F5F9] font-medium border border-[#1A2442]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Applicant Card */}
              <div className="p-4 rounded-2xl bg-[#070D1E] border border-[#1A2442] space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-[#F1F5F9] text-sm">
                  <User className="h-4 w-4 text-[#F59E0B]" />
                  <span>Applicant Information</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#A8B3C7]">Full Name:</span>
                    <div className="font-semibold text-[#F1F5F9]">{selectedItem.applicantName}</div>
                  </div>
                  <div>
                    <span className="text-[#A8B3C7]">Email:</span>
                    <div className="font-mono text-[#F1F5F9]">{selectedItem.applicantEmail}</div>
                  </div>
                  <div>
                    <span className="text-[#A8B3C7]">Country:</span>
                    <div className="text-[#F1F5F9]">
                      {selectedItem.applicantCountry || 'Global'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#A8B3C7]">Role:</span>
                    <div className="font-semibold text-[#F1F5F9]">
                      {selectedItem.applicantRole || 'Owner'}
                    </div>
                  </div>
                  {selectedItem.applicantPhone && (
                    <div>
                      <span className="text-[#A8B3C7]">Phone:</span>
                      <div className="font-mono text-[#F1F5F9]">{selectedItem.applicantPhone}</div>
                    </div>
                  )}
                  {selectedItem.telegramOrDiscord && (
                    <div>
                      <span className="text-[#A8B3C7]">Discord / Telegram:</span>
                      <div className="font-mono text-[#F1F5F9]">
                        {selectedItem.telegramOrDiscord}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mirrors / Additional Domains */}
              {Array.isArray(selectedItem.additionalDomains) &&
                selectedItem.additionalDomains.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#070D1E] border border-[#1A2442] space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#F1F5F9] text-sm">
                      <Radio className="h-4 w-4 text-[#3B82F6]" />
                      <span>Additional Mirrors ({selectedItem.additionalDomains.length})</span>
                    </div>
                    <div className="space-y-1">
                      {selectedItem.additionalDomains.map((m: string, i: number) => (
                        <div
                          key={i}
                          className="font-mono text-xs text-[#3B82F6] bg-[#050A18] p-2 rounded border border-[#1A2442]"
                        >
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Ownership Verification Proof */}
              <div className="p-4 rounded-2xl bg-[#070D1E] border border-[#1A2442] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#F1F5F9] text-sm">
                  <Shield className="h-4 w-4 text-[#22C55E]" />
                  <span>Ownership Verification</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#A8B3C7]">Method:</span>
                    <div className="font-semibold text-[#F1F5F9]">
                      {selectedItem.verificationMethod || 'DNS_TXT'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#A8B3C7]">Token:</span>
                    <div className="font-mono text-[#F1F5F9] text-[11px] truncate">
                      {selectedItem.verificationToken || 'N/A'}
                    </div>
                  </div>
                </div>
                {selectedItem.verificationProof && (
                  <div>
                    <span className="text-[#A8B3C7]">Proof Details / Notes:</span>
                    <p className="bg-[#050A18] p-2 rounded border border-[#1A2442] text-[#F1F5F9] font-mono text-[11px] mt-0.5">
                      {selectedItem.verificationProof}
                    </p>
                  </div>
                )}
                {selectedItem.adminNote && (
                  <div>
                    <span className="text-[#A8B3C7]">Applicant Note to Reviewers:</span>
                    <p className="bg-[#050A18] p-2 rounded border border-[#1A2442] text-[#F1F5F9] text-xs mt-0.5">
                      {selectedItem.adminNote}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Selection / Form */}
            {actionType ? (
              <div className="p-4 rounded-2xl border border-[#2563EB]/40 bg-[#2563EB]/10 space-y-3">
                <div className="font-bold text-[#F1F5F9] text-xs uppercase tracking-wider">
                  {actionType === 'APPROVE' && 'Confirm Approval'}
                  {actionType === 'REJECT' && 'Reject Application with Reason'}
                  {actionType === 'REQUEST_CHANGES' && 'Request Changes with Note'}
                </div>

                {actionType === 'APPROVE' && (
                  <p className="text-xs text-[#A8B3C7] leading-relaxed">
                    Approving will automatically create the Website Owner account in{' '}
                    <strong className="text-[#F1F5F9]">INVITED</strong> status, create the{' '}
                    <strong className="text-[#F1F5F9]">ACTIVE</strong> website profile, register the
                    primary domain, generate a 24-hour setup token, and email the invitation.
                  </p>
                )}

                {(actionType === 'REJECT' || actionType === 'REQUEST_CHANGES') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
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
                      className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] p-2.5 text-xs text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className="px-3 py-1.5 rounded-lg border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]"
                  >
                    Cancel
                  </button>

                  {actionType === 'APPROVE' && (
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => handleApprove(selectedItem.id)}
                      className="px-4 py-1.5 rounded-lg bg-[#22C55E] text-white font-bold text-xs hover:bg-[#16A34A] disabled:opacity-50 inline-flex items-center gap-1.5 shadow-md shadow-[#22C55E]/20"
                    >
                      {submittingAction && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Confirm & Approve
                    </button>
                  )}

                  {actionType === 'REJECT' && (
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => handleReject(selectedItem.id)}
                      className="px-4 py-1.5 rounded-lg bg-[#EF4444] text-white font-bold text-xs hover:bg-[#DC2626] disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {submittingAction && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Send Rejection Email
                    </button>
                  )}

                  {actionType === 'REQUEST_CHANGES' && (
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => handleRequestChanges(selectedItem.id)}
                      className="px-4 py-1.5 rounded-lg bg-[#2563EB] text-white font-bold text-xs hover:bg-[#1D4ED8] disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {submittingAction && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Send Change Request Link
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1A2442]">
                <span className="text-xs text-[#A8B3C7]">Select an outcome:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActionType('REQUEST_CHANGES');
                      setActionNote('');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-[#2563EB]/40 bg-[#2563EB]/15 text-[#3B82F6] font-bold text-xs hover:bg-[#2563EB]/25 transition-colors"
                  >
                    Request Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionType('REJECT');
                      setActionNote('');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/15 text-[#EF4444] font-bold text-xs hover:bg-[#EF4444]/25 transition-colors"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('APPROVE')}
                    className="px-4 py-2 rounded-xl bg-[#22C55E] text-white font-bold text-xs hover:bg-[#16A34A] transition-colors shadow-md shadow-[#22C55E]/20 inline-flex items-center gap-1.5"
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
        <div className="py-20 text-center text-xs text-[#A8B3C7]">
          Loading registration review queue...
        </div>
      }
    >
      <RegistrationsContent />
    </Suspense>
  );
}
