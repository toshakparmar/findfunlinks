'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { api, type RegistrationRequestDetails } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import { formatTimeAgo } from '../../lib/utils';
import { Search, Check, X, RotateCcw, ExternalLink, Globe, User, Loader2, Eye } from 'lucide-react';

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
    } catch (err: unknown) {
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
      await api.admin.approveRegistration(id);
      toast.success(
        'Registration approved! User, website & domains provisioned and invite email sent.',
      );
      setActionType(null);
      setSelectedItem(null);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Registration Queue</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review applicant identity, verify website URLs, and approve owner credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRegistrations}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

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
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRegistrations()}
            placeholder="Search applicant, site, or URL..."
            className="w-full rounded-xl border border-input bg-background pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                  <th className="py-3 px-4 font-semibold">Website</th>
                  <th className="py-3 px-4 font-semibold">Applicant</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">{reg.websiteName}</div>
                      <a
                        href={reg.primaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-primary hover:underline inline-flex items-center gap-1 truncate max-w-xs"
                      >
                        {reg.primaryUrl}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      <div className="font-medium text-foreground">{reg.applicantName}</div>
                      <div className="text-[11px]">{reg.applicantEmail}</div>
                      {reg.applicantCountry && (
                        <span className="text-[10px] text-muted-foreground/70">
                          📍 {reg.applicantCountry}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={reg.status} />
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      {formatTimeAgo(reg.submittedAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(reg)}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-colors inline-flex items-center gap-1"
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
          <div className="text-center py-16 text-xs text-muted-foreground">
            No registration requests found matching this filter.
          </div>
        )}
      </div>

      {/* Review & Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="text-lg font-black text-foreground">
                  Review Submission: {selectedItem.websiteName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  ID: {selectedItem.id} • Submitted {formatTimeAgo(selectedItem.submittedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setActionType(null);
                }}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>Website Profile</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Primary URL:</span>
                    <div className="font-mono text-foreground font-medium truncate">
                      <a
                        href={selectedItem.primaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedItem.primaryUrl}
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Content Rating:</span>
                    <div className="font-semibold text-foreground">
                      {selectedItem.contentRating}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="text-foreground mt-0.5 leading-relaxed bg-background p-2.5 rounded-lg border border-border/40">
                    {selectedItem.description}
                  </p>
                </div>

                {Array.isArray(selectedItem.proposedTags) &&
                  selectedItem.proposedTags.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Proposed Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(selectedItem.proposedTags as string[]).map((t: string) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-background text-foreground font-medium border border-border/40"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                  <User className="h-4 w-4 text-brand-orange-500" />
                  <span>Applicant Information</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Full Name:</span>
                    <div className="font-semibold text-foreground">
                      {selectedItem.applicantName}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <div className="font-mono text-foreground">{selectedItem.applicantEmail}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span>
                    <div className="text-foreground">
                      {selectedItem.applicantCountry || 'Global'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telegram/Discord:</span>
                    <div className="text-foreground">
                      {selectedItem.telegramOrDiscord || 'None'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Selection / Form */}
            {actionType ? (
              <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="font-bold text-foreground text-xs uppercase tracking-wider">
                  {actionType === 'APPROVE' && 'Confirm Approval'}
                  {actionType === 'REJECT' && 'Reject Application with Reason'}
                  {actionType === 'REQUEST_CHANGES' && 'Request Changes with Note'}
                </div>

                {actionType === 'APPROVE' && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Approving will automatically create the Website Owner account in{' '}
                    <strong>INVITED</strong> status, create the <strong>ACTIVE</strong> website
                    profile, register the primary domain, generate a 24-hour setup token, and email
                    the invitation.
                  </p>
                )}

                {(actionType === 'REJECT' || actionType === 'REQUEST_CHANGES') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground uppercase mb-1">
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
                      className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>

                  {actionType === 'APPROVE' && (
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => handleApprove(selectedItem.id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-1.5"
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
                      className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-50 inline-flex items-center gap-1.5"
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
                      className="px-4 py-1.5 rounded-lg bg-brand-blue-600 text-white font-bold text-xs hover:bg-brand-blue-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {submittingAction && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Send Change Request Link
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
                <span className="text-xs text-muted-foreground">Select an outcome:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActionType('REQUEST_CHANGES');
                      setActionNote('');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-brand-blue-500/30 bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400 font-bold text-xs hover:bg-brand-blue-500/20 transition-colors"
                  >
                    Request Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionType('REJECT');
                      setActionNote('');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition-colors"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('APPROVE')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm inline-flex items-center gap-1.5"
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
        <div className="py-20 text-center text-xs text-muted-foreground">
          Loading registration review queue...
        </div>
      }
    >
      <RegistrationsContent />
    </Suspense>
  );
}
