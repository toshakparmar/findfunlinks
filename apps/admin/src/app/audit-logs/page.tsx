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
          <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">System Audit Logs</h1>
          <p className="text-xs text-[#A8B3C7] mt-1">
            Immutable security ledger tracking platform operations, status mutations, and approval
            events.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {entityTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setEntityTypeFilter(type);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              entityTypeFilter === type
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'border border-[#1A2442] bg-[#0A1226] text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1A2442] bg-[#0A1226] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1A2442] bg-[#070D1E] text-[#A8B3C7]">
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Actor</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Target Entity</th>
                  <th className="py-3 px-4 font-semibold text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2442]/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0E182F] transition-colors">
                    <td className="py-3 px-4 text-[#A8B3C7] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      {log.actor ? (
                        <div>
                          <div className="font-semibold text-[#F1F5F9]">{log.actor.name}</div>
                          <div className="text-[10px] font-mono text-[#A8B3C7]">
                            {log.actor.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#6B7893] font-mono">System / Internal</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#070D1E] border border-[#1A2442] text-[#3B82F6] font-semibold">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#F1F5F9]">
                      <span className="font-semibold">{log.entityType}</span>
                      <span className="text-[#6B7893] ml-1.5 font-mono text-[11px]">
                        #{log.entityId.slice(0, 8)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-[#2563EB]/15 text-[#3B82F6] font-semibold hover:bg-[#2563EB] hover:text-white transition-colors border border-[#2563EB]/30 inline-flex items-center gap-1"
                      >
                        <Code className="h-3 w-3" />
                        Diff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#A8B3C7]">
            No audit log records found for selected entity type.
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

      {/* Diff / Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-3xl border border-[#1A2442] bg-[#0A1226] max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A2442] pb-3">
              <h2 className="text-base font-bold text-[#F1F5F9]">
                Audit Payload — {selectedLog.action}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-[#A8B3C7] hover:text-[#F1F5F9]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto">
              {selectedLog.before && (
                <div>
                  <span className="font-semibold text-[#EF4444]">State Before:</span>
                  <pre className="p-3 rounded-xl bg-[#050A18] border border-[#1A2442] text-[11px] font-mono text-[#F1F5F9] overflow-x-auto mt-1">
                    {JSON.stringify(selectedLog.before, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.after && (
                <div>
                  <span className="font-semibold text-[#22C55E]">State After:</span>
                  <pre className="p-3 rounded-xl bg-[#050A18] border border-[#1A2442] text-[11px] font-mono text-[#F1F5F9] overflow-x-auto mt-1">
                    {JSON.stringify(selectedLog.after, null, 2)}
                  </pre>
                </div>
              )}

              {!selectedLog.before && !selectedLog.after && (
                <p className="text-[#A8B3C7] text-center py-6">
                  No before/after snapshot attached to this audit event.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1A2442]">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-xl bg-[#1A2442] hover:bg-[#0E182F] text-xs font-semibold text-[#F1F5F9]"
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
