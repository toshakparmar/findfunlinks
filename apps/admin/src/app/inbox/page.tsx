'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import {
  RefreshCw,
  Search,
  Globe,
  X,
  Loader2,
  Send,
  Mail,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

interface QueryItem {
  id: string;
  websiteId?: string | null;
  domainId?: string | null;
  reason: string;
  details?: string | null;
  reporterEmail?: string | null;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  website?: { id: string; name: string; slug: string } | null;
  domain?: { id: string; hostname: string; url: string; status: string } | null;
  handledBy?: { id: string; name: string; email: string } | null;
}

const CANNED_RESPONSES = [
  {
    title: 'Mirror Verified & Updated',
    body: 'Thank you for notifying us. Our monitoring system has verified the reported link and updated the directory with healthy, responsive mirrors.',
  },
  {
    title: 'Issue Resolved',
    body: 'Thank you for your report. The reported issue has been addressed and the listing status has been resolved.',
  },
  {
    title: 'Duplicate Submission',
    body: 'Thank you for contacting us. We have already logged and are actively resolving an identical inquiry for this link.',
  },
  {
    title: 'Under Investigation',
    body: 'We have received your report and our curation team is actively investigating the reported mirror with our DNS health check system.',
  },
];

export default function InboxPage() {
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'>('ALL');
  const [selectedItem, setSelectedItem] = useState<QueryItem | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getReports({
        page,
        limit: 20,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setQueries(res.items);
      setTotalPages(res.totalPages || 1);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load inbox items');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const handleUpdateStatus = async (id: string, newStatus: 'RESOLVED' | 'DISMISSED') => {
    try {
      await api.admin.updateReportStatus(id, newStatus);
      toast.success(`Query marked as ${newStatus.toLowerCase()}`);
      setQueries((prev) => prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q)));
      if (selectedItem?.id === id) {
        setSelectedItem((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleSendReply = async () => {
    if (!selectedItem) return;
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message.');
      return;
    }
    if (!selectedItem.reporterEmail) {
      toast.error('No reporter email address on this query to reply to.');
      return;
    }

    try {
      setSendingReply(true);
      await api.admin.replyReport(selectedItem.id, replyMessage.trim());
      toast.success(`Reply email dispatched to ${selectedItem.reporterEmail}!`);
      setQueries((prev) =>
        prev.map((q) => (q.id === selectedItem.id ? { ...q, status: 'RESOLVED' } : q)),
      );
      setSelectedItem((prev) => (prev ? { ...prev, status: 'RESOLVED' } : null));
      setReplyMessage('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">
            Queries & Inbound Inbox
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Centralized communications desk for broken link reports, DMCA requests, and visitor suggestions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchQueries}
          className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-4 h-11 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#0B9DF7] text-white'
                  : 'border border-[#33373D] bg-[#1E2024] text-[#9CA3AF] hover:bg-[#26292F] hover:text-white'
              }`}
            >
              {st === 'PENDING' ? 'New / Pending' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <Search className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, ticket ID, or issue..."
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
        ) : queries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#33373D] bg-[#16181B] text-[#9CA3AF]">
                  <th className="py-3 px-4 font-medium">Ticket ID</th>
                  <th className="py-3 px-4 font-medium">Topic / Reason</th>
                  <th className="py-3 px-4 font-medium">Target Entity</th>
                  <th className="py-3 px-4 font-medium">Sender</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#33373D]">
                {queries.map((item) => (
                  <tr key={item.id} className="hover:bg-[#26292F] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-[#0B9DF7] font-semibold">
                      [FL-{item.id.slice(0, 8).toUpperCase()}]
                    </td>

                    <td className="py-3.5 px-4 font-medium text-[#F3F4F6]">
                      <div className="truncate max-w-xs">{item.reason}</div>
                      {item.details && (
                        <div className="text-xs text-[#9CA3AF] truncate max-w-xs mt-0.5">
                          {item.details}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#9CA3AF]">
                      {item.website ? (
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-[#0B9DF7]" />
                          <span className="text-[#F3F4F6] font-medium">{item.website.name}</span>
                        </div>
                      ) : item.domain ? (
                        <span className="font-mono text-xs text-[#0B9DF7]">{item.domain.hostname}</span>
                      ) : (
                        <span className="text-[#6B7280]">General Platform</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#9CA3AF]">
                      {item.reporterEmail ? (
                        <span className="font-mono text-xs">{item.reporterEmail}</span>
                      ) : (
                        <span className="text-[#6B7280]">Anonymous</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="py-3.5 px-4 text-xs font-mono text-[#9CA3AF]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="px-3.5 h-9 rounded-lg bg-[#26292F] text-[#0B9DF7] font-medium hover:bg-[#33373D] hover:text-white transition-colors border border-[#33373D] inline-flex items-center gap-1.5 text-xs"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Inspect & Reply</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-[#9CA3AF]">
            No messages or reports found matching current filter.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#33373D] bg-[#16181B] text-sm text-[#9CA3AF]">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 h-8 rounded-lg border border-[#33373D] bg-[#1E2024] text-[#D1D5DB] disabled:opacity-40 hover:bg-[#26292F]"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 h-8 rounded-lg border border-[#33373D] bg-[#1E2024] text-[#D1D5DB] disabled:opacity-40 hover:bg-[#26292F]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Details & Reply Composer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-[#33373D] bg-[#1E2024] max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#33373D] pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#0B9DF7]">
                    [FL-{selectedItem.id.slice(0, 8).toUpperCase()}]
                  </span>
                  <h2 className="text-lg font-bold text-[#F3F4F6]">{selectedItem.reason}</h2>
                  <StatusBadge status={selectedItem.status} />
                </div>
                <div className="text-xs text-[#9CA3AF] mt-1">
                  Received {new Date(selectedItem.createdAt).toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-lg border border-[#33373D] text-[#9CA3AF] hover:text-white hover:bg-[#26292F] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Original Inbound Message Card */}
            <div className="p-4 rounded-xl bg-[#16181B] border border-[#33373D] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9CA3AF]">
                  Sender:{' '}
                  <strong className="text-[#F3F4F6] font-mono">
                    {selectedItem.reporterEmail || 'Anonymous'}
                  </strong>
                </span>
                {selectedItem.website && (
                  <span className="text-[#9CA3AF]">
                    Target Listing:{' '}
                    <strong className="text-[#F3F4F6]">{selectedItem.website.name}</strong>
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs text-[#9CA3AF]">Explanation / Message:</span>
                <p className="text-sm text-[#D1D5DB] mt-1 leading-relaxed bg-[#1E2024] p-3 rounded-lg border border-[#33373D]">
                  {selectedItem.details || 'No additional explanation provided.'}
                </p>
              </div>
            </div>

            {/* Reply Composer Card */}
            <div className="p-4 rounded-xl bg-[#16181B] border border-[#33373D] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#F3F4F6]">
                  <Mail className="h-4 w-4 text-[#0B9DF7]" />
                  <span>Send Email Reply</span>
                </div>

                {/* Canned Response Picker */}
                <select
                  onChange={(e) => {
                    const found = CANNED_RESPONSES.find((c) => c.title === e.target.value);
                    if (found) setReplyMessage(found.body);
                  }}
                  defaultValue=""
                  className="h-9 px-3 rounded-lg border border-[#33373D] bg-[#1E2024] text-xs text-[#D1D5DB] focus:outline-none focus:border-[#0B9DF7]"
                >
                  <option value="" disabled>
                    Insert Canned Template…
                  </option>
                  {CANNED_RESPONSES.map((c) => (
                    <option key={c.title} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                rows={4}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write your official response to the reporter here..."
                className="w-full rounded-lg border border-[#33373D] bg-[#1E2024] p-3 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#9CA3AF]">
                  Will be emailed with subject:{' '}
                  <code className="text-[#0B9DF7]">
                    [FL-{selectedItem.id.slice(0, 8).toUpperCase()}] {selectedItem.reason}
                  </code>
                </span>

                <button
                  type="button"
                  disabled={sendingReply || !replyMessage.trim() || !selectedItem.reporterEmail}
                  onClick={handleSendReply}
                  className="px-5 h-11 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-white text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {sendingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Send & Resolve</span>
                </button>
              </div>
            </div>

            {/* Quick Resolution Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#33373D]">
              <span className="text-xs text-[#9CA3AF]">Alternative ticket actions:</span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedItem.id, 'DISMISSED')}
                  className="px-4 h-11 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white"
                >
                  Dismiss Query
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedItem.id, 'RESOLVED')}
                  className="px-5 h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mark Resolved</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
