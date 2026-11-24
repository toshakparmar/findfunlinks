'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { AlertTriangle, RefreshCw, Search, Eye, Globe, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReportItem {
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

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'>(
    'ALL',
  );
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getReports({
        page,
        limit: 20,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setReports(res.items);
      setTotalPages(res.totalPages || 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load reports';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (id: string, newStatus: 'RESOLVED' | 'DISMISSED') => {
    setUpdatingId(id);
    try {
      await api.admin.updateReportStatus(id, newStatus);
      toast.success(`Report marked as ${newStatus.toLowerCase()}`);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      if (selectedReport?.id === id) {
        setSelectedReport((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update report';
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.reason.toLowerCase().includes(q) ||
      (r.details && r.details.toLowerCase().includes(q)) ||
      (r.reporterEmail && r.reporterEmail.toLowerCase().includes(q)) ||
      (r.website?.name && r.website.name.toLowerCase().includes(q)) ||
      (r.domain?.hostname && r.domain.hostname.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">Reports & Moderation</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Review user-submitted reports regarding broken links, malicious content, or policy
            violations.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReports}
          className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
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
              {st}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <Search className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
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
        ) : filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#33373D] bg-[#16181B] text-[#9CA3AF]">
                  <th className="py-3 px-4 font-medium">Target Entity</th>
                  <th className="py-3 px-4 font-medium">Reason</th>
                  <th className="py-3 px-4 font-medium">Reporter</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#33373D]">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-[#26292F] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#F3F4F6]">
                      {report.website ? (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-[#0B9DF7]" />
                          <span>{report.website.name}</span>
                        </div>
                      ) : report.domain ? (
                        <div className="font-mono text-xs text-[#9CA3AF]">
                          {report.domain.hostname}
                        </div>
                      ) : (
                        <span className="text-[#6B7280]">General Platform</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#F3F4F6] font-medium">
                      <div className="truncate max-w-xs">{report.reason}</div>
                      {report.details && (
                        <div className="text-xs text-[#9CA3AF] truncate max-w-xs mt-0.5">
                          {report.details}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#9CA3AF]">
                      {report.reporterEmail || <span className="text-[#6B7280]">Anonymous</span>}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={report.status} />
                    </td>

                    <td className="py-3.5 px-4 text-[#9CA3AF] text-xs font-mono">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReport(report)}
                        className="px-3.5 h-9 rounded-lg bg-[#26292F] text-[#0B9DF7] font-medium hover:bg-[#33373D] hover:text-white transition-colors border border-[#33373D] inline-flex items-center gap-1.5"
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
          <div className="p-12 text-center text-sm text-[#9CA3AF]">
            No reports found matching your criteria.
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

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-[#33373D] bg-[#1E2024] max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h2 className="text-base font-bold text-[#F3F4F6]">Report Details</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="text-[#9CA3AF] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-4 rounded-xl bg-[#16181B] border border-[#33373D] space-y-2">
                <div>
                  <span className="text-xs text-[#9CA3AF]">Reason:</span>
                  <div className="font-semibold text-[#F3F4F6] mt-0.5">{selectedReport.reason}</div>
                </div>
                {selectedReport.details && (
                  <div>
                    <span className="text-xs text-[#9CA3AF]">Full Explanation:</span>
                    <p className="text-xs text-[#D1D5DB] mt-1 leading-relaxed bg-[#1E2024] p-3 rounded-lg border border-[#33373D]">
                      {selectedReport.details}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#16181B] border border-[#33373D] text-xs">
                <div>
                  <span className="text-[#9CA3AF]">Reporter:</span>
                  <div className="font-mono text-[#F3F4F6] mt-0.5">
                    {selectedReport.reporterEmail || 'Anonymous'}
                  </div>
                </div>
                <div>
                  <span className="text-[#9CA3AF]">Current Status:</span>
                  <div className="mt-0.5">
                    <StatusBadge status={selectedReport.status} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#33373D]">
              {selectedReport.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    disabled={updatingId === selectedReport.id}
                    onClick={() => handleUpdateStatus(selectedReport.id, 'DISMISSED')}
                    className="px-4 h-11 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white"
                  >
                    Dismiss Report
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === selectedReport.id}
                    onClick={() => handleUpdateStatus(selectedReport.id, 'RESOLVED')}
                    className="px-5 h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                  >
                    Mark Resolved
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
