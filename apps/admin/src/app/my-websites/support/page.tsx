'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { formatTimeAgo } from '@/lib/utils';
import { LifeBuoy, Plus, RefreshCw, Loader2, X, MessageSquare, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SupportTicket {
  id: string;
  reason: string;
  details: string;
  status: string;
  reporterEmail?: string | null;
  createdAt: string;
  website?: { id: string; name: string; slug: string } | null;
  domain?: { id: string; hostname: string; url: string } | null;
  handledBy?: { id: string; name: string; email: string } | null;
}

export default function OwnerSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Form
  const [reason, setReason] = useState('Broken Link / Mirror Down');
  const [details, setDetails] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.owner.getMyReports();
      setTickets(res);
      if (res.length > 0 && !selectedTicket) {
        setSelectedTicket(res[0]!);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch support tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      toast.error('Please provide inquiry details.');
      return;
    }

    setSubmitting(true);
    try {
      await api.owner.createSupportTicket({ reason, details: details.trim() });
      toast.success('Support ticket submitted successfully! Our operators will reply shortly.');
      setModalOpen(false);
      setDetails('');
      fetchTickets();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">
            Support & Operator Inquiries
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Submit questions, domain unblock requests, or report issues directly to directory
            operators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            className="h-10 px-3.5 inline-flex items-center gap-2 rounded-lg border border-[#33373D] bg-[#1E2024] text-xs font-semibold text-[#F3F4F6] hover:bg-[#26292F] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0B9DF7]" />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-[#0B9DF7] hover:bg-[#0A8FE0] text-sm font-semibold text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0B9DF7]" />
          <p className="text-sm text-[#9CA3AF]">Loading your support inquiries...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-8 max-w-xl mx-auto rounded-xl border border-[#33373D] bg-[#1E2024] text-center space-y-4 mt-12 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-[#0B9DF7]/15 border border-[#0B9DF7]/30 flex items-center justify-center mx-auto text-[#0B9DF7]">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#F3F4F6]">No Open Support Tickets</h2>
            <p className="text-sm text-[#9CA3AF]">
              Need help updating your listing, unblocking a mirror, or requesting category
              reassignment? Open a support ticket.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-[#0B9DF7] hover:bg-[#0A8FE0] text-sm font-semibold text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Ticket
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                Your Tickets ({tickets.length})
              </span>
            </div>

            <div className="space-y-2.5">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-sm ${
                      isSelected
                        ? 'border-[#0B9DF7] bg-[#1E2024] shadow-md ring-1 ring-[#0B9DF7]'
                        : 'border-[#33373D] bg-[#1E2024] hover:border-[#4B5563]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-semibold text-[#0B9DF7]">
                        [FL-REF-{t.id.slice(0, 8).toUpperCase()}]
                      </span>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="font-semibold text-[#F3F4F6] line-clamp-1">{t.reason}</p>
                    <p className="text-xs text-[#9CA3AF] line-clamp-2 mt-1">{t.details}</p>
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#33373D]/60 text-[11px] text-[#9CA3AF]">
                      <span>{formatTimeAgo(t.createdAt)}</span>
                      {t.handledBy && <span className="text-[#22C55E]">Staff Replied</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ticket Detail / Thread */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-[#1E2024] rounded-xl border border-[#33373D] p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#33373D] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0B9DF7]">
                        [FL-REF-{selectedTicket.id.slice(0, 8).toUpperCase()}]
                      </span>
                      <StatusBadge status={selectedTicket.status} />
                    </div>
                    <h2 className="text-xl font-bold text-[#F3F4F6] mt-1">
                      {selectedTicket.reason}
                    </h2>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      Submitted on {new Date(selectedTicket.createdAt).toLocaleDateString()} at{' '}
                      {new Date(selectedTicket.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Inquiry Content */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#16181B] border border-[#33373D] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#9CA3AF] border-b border-[#33373D]/60 pb-2">
                      <span className="font-semibold text-[#F3F4F6]">Your Inquiry Details:</span>
                      <span>{selectedTicket.reporterEmail}</span>
                    </div>
                    <p className="text-sm text-[#F3F4F6] whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.details}
                    </p>
                  </div>

                  {/* Admin Resolution / Reply Section */}
                  {selectedTicket.handledBy ? (
                    <div className="p-4 rounded-lg bg-[#0B9DF7]/10 border border-[#0B9DF7]/30 space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#0B9DF7] border-b border-[#0B9DF7]/20 pb-2">
                        <span className="font-bold flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4" />
                          FinalLinks Support Team
                        </span>
                        <span className="font-semibold">{selectedTicket.handledBy.name}</span>
                      </div>
                      <p className="text-sm text-[#F3F4F6] leading-relaxed">
                        This inquiry has been reviewed and responded to by our administrative
                        operators. An official reply has also been delivered to your email inbox.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-[#16181B] border border-[#33373D] flex items-center gap-3 text-sm text-[#9CA3AF]">
                      <HelpCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
                      <span>
                        Ticket is pending review. Operators typically reply within 24-48 business
                        hours.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#1E2024] rounded-xl border border-[#33373D] p-12 text-center text-[#9CA3AF] text-sm">
                Select a ticket from the list to view inquiry details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E2024] border border-[#33373D] rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-3.5">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-[#0B9DF7]" />
                <h3 className="font-bold text-base text-[#F3F4F6]">Create Support Ticket</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#F3F4F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                  Inquiry Topic *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                >
                  <option value="Broken Link / Mirror Down">Broken Link / Mirror Down</option>
                  <option value="Domain Unblock Request">Domain Unblock Request</option>
                  <option value="Category Reassignment Request">
                    Category Reassignment Request
                  </option>
                  <option value="Ownership / Credentials Inquiry">
                    Ownership / Credentials Inquiry
                  </option>
                  <option value="General Question / Technical Support">
                    General Question / Technical Support
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                  Detailed Explanation *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe your issue, affected domain URLs, or requested changes in detail..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[#33373D] bg-[#16181B] text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] focus:ring-1 focus:ring-[#0B9DF7]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#33373D]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-10 px-4 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#9CA3AF] hover:text-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-4 rounded-lg bg-[#0B9DF7] hover:bg-[#0A8FE0] text-sm font-semibold text-white transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
