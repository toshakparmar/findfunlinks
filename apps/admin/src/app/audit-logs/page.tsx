'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { RefreshCw, X, Code, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLogItem {
  id: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getAuditLogs({
        page,
        limit: 25,
        entityType: entityTypeFilter === 'ALL' ? undefined : entityTypeFilter,
      });
      setLogs(res.items);
      setTotalPages(res.totalPages || 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load audit logs';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, entityTypeFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const entityTypes = [
    'ALL',
    'Website',
    'Domain',
    'RegistrationRequest',
    'Category',
    'Tag',
    'User',
    'Report',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Immutable security ledger tracking platform operations, status mutations, and approval events.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {entityTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setEntityTypeFilter(type);
              setPage(1);
            }}
            className={`px-4 h-11 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              entityTypeFilter === type
                ? 'bg-[#0B9DF7] text-white'
                : 'border border-[#33373D] bg-[#1E2024] text-[#9CA3AF] hover:bg-[#26292F] hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#33373D] bg-[#1E2024] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-[#0B9DF7]" />
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#33373D] bg-[#16181B] text-[#9CA3AF]">
                  <th className="py-3 px-4 font-medium">Timestamp</th>
                  <th className="py-3 px-4 font-medium">Actor</th>
                  <th className="py-3 px-4 font-medium">Action</th>
                  <th className="py-3 px-4 font-medium">Target Entity</th>
                  <th className="py-3 px-4 font-medium text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#33373D]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#26292F] transition-colors">
                    <td className="py-3.5 px-4 text-[#9CA3AF] whitespace-nowrap font-mono text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      {log.actor ? (
                        <div>
                          <div className="font-semibold text-[#F3F4F6]">{log.actor.name}</div>
                          <div className="text-xs font-mono text-[#9CA3AF]">
                            {log.actor.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#6B7280] font-mono text-xs">System / Internal</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#26292F] border border-[#33373D] text-[#0B9DF7] font-medium">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#F3F4F6]">
                      <span className="font-medium">{log.entityType}</span>
                      <span className="text-[#6B7280] ml-2 font-mono text-xs">
                        #{log.entityId.slice(0, 8)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-3 h-8 rounded-lg bg-[#26292F] text-[#0B9DF7] font-medium hover:bg-[#33373D] hover:text-white transition-colors border border-[#33373D] inline-flex items-center gap-1.5 text-xs"
                      >
                        <Code className="h-3.5 w-3.5" />
                        Diff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-[#9CA3AF]">
            No audit log records found for selected entity type.
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

      {/* Diff / Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-[#33373D] bg-[#1E2024] max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-3">
              <h2 className="text-base font-bold text-[#F3F4F6]">
                Audit Payload — {selectedLog.action}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-[#9CA3AF] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto">
              {selectedLog.before && (
                <div>
                  <span className="font-semibold text-red-400 text-xs uppercase tracking-wider">State Before:</span>
                  <pre className="p-3.5 rounded-lg bg-[#16181B] border border-[#33373D] text-xs font-mono text-[#D1D5DB] overflow-x-auto mt-1.5 leading-relaxed">
                    {JSON.stringify(selectedLog.before, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.after && (
                <div>
                  <span className="font-semibold text-emerald-400 text-xs uppercase tracking-wider">State After:</span>
                  <pre className="p-3.5 rounded-lg bg-[#16181B] border border-[#33373D] text-xs font-mono text-[#D1D5DB] overflow-x-auto mt-1.5 leading-relaxed">
                    {JSON.stringify(selectedLog.after, null, 2)}
                  </pre>
                </div>
              )}

              {!selectedLog.before && !selectedLog.after && (
                <p className="text-[#9CA3AF] text-center py-6 text-sm">
                  No before/after snapshot attached to this audit event.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#33373D]">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 h-11 rounded-lg bg-[#26292F] hover:bg-[#33373D] text-sm font-medium text-[#F3F4F6] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
