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
      });
      setReports(res.items);
      setTotalPages(res.totalPages || 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load reports';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

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
          <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">
            Reports & Moderation
          </h1>
          <p className="text-xs text-[#A8B3C7] mt-1">
            Review user-submitted reports regarding broken links, malicious content, or policy
            violations.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReports}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'border border-[#1A2442] bg-[#0A1226] text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="h-4 w-4 text-[#6B7893] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
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
        ) : filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1A2442] bg-[#070D1E] text-[#A8B3C7]">
                  <th className="py-3 px-4 font-semibold">Target Entity</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                  <th className="py-3 px-4 font-semibold">Reporter</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2442]/60">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-[#0E182F] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#F1F5F9]">
                      {report.website ? (
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-[#3B82F6]" />
                          <span>{report.website.name}</span>
                        </div>
                      ) : report.domain ? (
                        <div className="font-mono text-[11px] text-[#A8B3C7]">
                          {report.domain.hostname}
                        </div>
                      ) : (
                        <span className="text-[#6B7893]">General Platform</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#F1F5F9] font-medium">
                      <div className="truncate max-w-xs">{report.reason}</div>
                      {report.details && (
                        <div className="text-[11px] text-[#A8B3C7] truncate max-w-xs mt-0.5">
                          {report.details}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#A8B3C7]">
                      {report.reporterEmail || <span className="text-[#6B7893]">Anonymous</span>}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={report.status} />
                    </td>

                    <td className="py-3.5 px-4 text-[#A8B3C7]">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedReport(report)}
                        className="px-2.5 py-1 rounded-lg bg-[#2563EB]/15 text-[#3B82F6] font-semibold hover:bg-[#2563EB] hover:text-white transition-colors border border-[#2563EB]/30 inline-flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
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
            No reports found matching your criteria.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1A2442] bg-[#070D1E] text-xs text-[#A8B3C7]">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-[#1A2442] bg-[#0A1226] text-[#F1F5F9] disabled:opacity-40 hover:bg-[#0E182F]"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded-lg border border-[#1A2442] bg-[#0A1226] text-[#F1F5F9] disabled:opacity-40 hover:bg-[#0E182F]"
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
          <div className="rounded-3xl border border-[#1A2442] bg-[#0A1226] max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A2442] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
                <h2 className="text-base font-bold text-[#F1F5F9]">Report Details</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="text-[#A8B3C7] hover:text-[#F1F5F9]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#070D1E] border border-[#1A2442] space-y-2">
                <div>
                  <span className="text-[#A8B3C7]">Reason:</span>
                  <div className="font-bold text-[#F1F5F9] mt-0.5">{selectedReport.reason}</div>
                </div>
                {selectedReport.details && (
                  <div>
                    <span className="text-[#A8B3C7]">Full Explanation:</span>
                    <p className="text-[#F1F5F9] mt-0.5 leading-relaxed bg-[#050A18] p-2.5 rounded-lg border border-[#1A2442]">
                      {selectedReport.details}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-xl bg-[#070D1E] border border-[#1A2442]">
                <div>
                  <span className="text-[#A8B3C7]">Reporter:</span>
                  <div className="font-mono text-[#F1F5F9] mt-0.5">
                    {selectedReport.reporterEmail || 'Anonymous'}
                  </div>
                </div>
                <div>
                  <span className="text-[#A8B3C7]">Current Status:</span>
                  <div className="mt-0.5">
                    <StatusBadge status={selectedReport.status} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1A2442]">
              {selectedReport.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    disabled={updatingId === selectedReport.id}
                    onClick={() => handleUpdateStatus(selectedReport.id, 'DISMISSED')}
                    className="px-3.5 py-1.5 rounded-xl border border-[#1A2442] bg-[#070D1E] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]"
                  >
                    Dismiss Report
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === selectedReport.id}
                    onClick={() => handleUpdateStatus(selectedReport.id, 'RESOLVED')}
                    className="px-4 py-1.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold transition-all shadow-md shadow-[#22C55E]/20"
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
