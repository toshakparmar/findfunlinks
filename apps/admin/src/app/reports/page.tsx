'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Eye,
  Globe,
  Clock,
  Mail,
} from 'lucide-react';
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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Broken Links & Abuse Reports
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Review user-submitted reports for broken domains, dead links, or misleading directory
            items.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {tab === 'ALL' ? 'All Reports' : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-xs uppercase text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Target Entity</th>
                <th className="py-3 px-4 font-semibold">Reason</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Reported</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading reports...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                    No reports found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      {report.domain ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-blue-500" />
                            {report.domain.hostname}
                          </span>
                          <span className="text-xs text-neutral-400">
                            Website: {report.website?.name || 'N/A'}
                          </span>
                        </div>
                      ) : report.website ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {report.website.name}
                          </span>
                          <span className="text-xs text-neutral-400">Website report</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">General platform report</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-neutral-800 dark:text-neutral-200 block truncate max-w-xs">
                        {report.reason}
                      </span>
                      {report.details && (
                        <span className="text-xs text-neutral-400 line-clamp-1 max-w-xs">
                          {report.details}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-500 whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                    Report Details
                  </h3>
                </div>
                <StatusBadge status={selectedReport.status} />
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                    Reason
                  </label>
                  <p className="font-medium text-neutral-900 dark:text-white mt-0.5">
                    {selectedReport.reason}
                  </p>
                </div>

                {selectedReport.details && (
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                      Additional Details
                    </label>
                    <p className="text-neutral-700 dark:text-neutral-300 mt-0.5 bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
                      {selectedReport.details}
                    </p>
                  </div>
                )}

                {selectedReport.domain && (
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                      Reported Mirror / Domain
                    </label>
                    <div className="mt-1 flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <div>
                        <span className="font-medium text-neutral-900 dark:text-white text-xs block">
                          {selectedReport.domain.hostname}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          Status: {selectedReport.domain.status}
                        </span>
                      </div>
                      <a
                        href={selectedReport.domain.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {selectedReport.website && (
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                      Website
                    </label>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200 text-xs mt-0.5">
                      {selectedReport.website.name} ({selectedReport.website.slug})
                    </p>
                  </div>
                )}

                {selectedReport.reporterEmail && (
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                      Reporter Contact
                    </label>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedReport.reporterEmail}
                    </div>
                  </div>
                )}

                <div className="text-xs text-neutral-400 flex items-center gap-1 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  Submitted on {new Date(selectedReport.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Close
                </button>
                {selectedReport.status === 'PENDING' && (
                  <>
                    <button
                      disabled={updatingId === selectedReport.id}
                      onClick={() => handleUpdateStatus(selectedReport.id, 'DISMISSED')}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700"
                    >
                      <XCircle className="w-3.5 h-3.5 text-neutral-500" />
                      Dismiss
                    </button>
                    <button
                      disabled={updatingId === selectedReport.id}
                      onClick={() => handleUpdateStatus(selectedReport.id, 'RESOLVED')}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
