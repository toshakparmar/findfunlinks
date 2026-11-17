'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Filter, RefreshCw, Eye, X, Code } from 'lucide-react';
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
    'Report',
    'User',
    'Role',
    'Setting',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            System Audit Trail
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Immutable log of all administrative actions, data modifications, and approvals.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Entity:
          </span>
          {entityTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setEntityTypeFilter(type);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                entityTypeFilter === type
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-xs uppercase text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Target Entity</th>
                <th className="py-3 px-4 font-semibold">IP Address</th>
                <th className="py-3 px-4 font-semibold text-right">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    No audit records found for this filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-xs text-neutral-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {log.actor ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-neutral-900 dark:text-white text-xs">
                            {log.actor.name}
                          </span>
                          <span className="text-[11px] text-neutral-400">{log.actor.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">System Auto-task</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {log.entityType}
                      </span>
                      <span className="text-neutral-400 block font-mono text-[10px] truncate max-w-[140px]">
                        {log.entityId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-neutral-400">
                      {log.ip || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {log.before || log.after ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">No diff</span>
                      )}
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

      {/* JSON Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                  Audit Snapshot Diff:{' '}
                  <span className="font-mono text-sm">{selectedLog.action}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before State */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    <span>State Before</span>
                    {selectedLog.before ? (
                      <span className="text-red-500 font-mono">Original</span>
                    ) : (
                      <span className="text-neutral-400">None (Created)</span>
                    )}
                  </div>
                  <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-xs overflow-x-auto max-h-[400px] border border-neutral-800">
                    {selectedLog.before
                      ? JSON.stringify(selectedLog.before, null, 2)
                      : '// No prior state (Entity created)'}
                  </pre>
                </div>

                {/* After State */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    <span>State After</span>
                    {selectedLog.after ? (
                      <span className="text-green-500 font-mono">Updated</span>
                    ) : (
                      <span className="text-neutral-400">None (Deleted)</span>
                    )}
                  </div>
                  <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-xs overflow-x-auto max-h-[400px] border border-neutral-800">
                    {selectedLog.after
                      ? JSON.stringify(selectedLog.after, null, 2)
                      : '// Entity deleted'}
                  </pre>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 flex flex-wrap gap-4">
                <div>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Entity:
                  </span>{' '}
                  {selectedLog.entityType} ({selectedLog.entityId})
                </div>
                <div>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Actor:
                  </span>{' '}
                  {selectedLog.actor?.email || 'System'}
                </div>
                <div>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">IP:</span>{' '}
                  {selectedLog.ip || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Timestamp:
                  </span>{' '}
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
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
