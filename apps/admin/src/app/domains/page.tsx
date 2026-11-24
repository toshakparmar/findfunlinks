'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import { formatTimeAgo } from '../../lib/utils';
import type { DomainItem } from '@finallinks/contracts';
import { Search, ExternalLink, Activity, RotateCcw, Loader2 } from 'lucide-react';

export default function DomainsAdminPage() {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getWebsites({ limit: 100 });
      const extracted: DomainItem[] = [];
      if (res && res.items) {
        for (const site of (res.items as any[])) {
          if (site.domains && Array.isArray(site.domains)) {
            extracted.push(...site.domains);
          }
        }
      }
      setDomains(extracted);
    } catch {
      toast.error('Failed to load domains.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleCheckDomain = async (id: string, hostname: string) => {
    try {
      setCheckingId(id);
      const res = await api.owner.checkDomain(id);
      toast.success(`Health check passed for ${hostname} (${res.lastResponseMs || 0}ms)`);
      await fetchDomains();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Health check failed.');
    } finally {
      setCheckingId(null);
    }
  };

  const filteredDomains = domains.filter((d) =>
    search ? d.hostname.toLowerCase().includes(search.toLowerCase()) : true,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">
            Domains & Working Mirrors
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Real-time status inspector for all hostnames, DNS entries, and ping latencies.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDomains}
          className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by hostname..."
          className="w-full h-11 rounded-lg border border-[#33373D] bg-[#1E2024] pl-10 pr-4 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#33373D] bg-[#1E2024] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-[#0B9DF7]" />
          </div>
        ) : filteredDomains.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#33373D] bg-[#16181B] text-[#9CA3AF]">
                  <th className="py-3 px-4 font-medium">Hostname</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Latency</th>
                  <th className="py-3 px-4 font-medium">Last Checked</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#33373D]">
                {filteredDomains.map((dom) => (
                  <tr key={dom.id} className="hover:bg-[#26292F] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#F3F4F6]">
                      <a
                        href={dom.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-[#0B9DF7] inline-flex items-center gap-1.5"
                      >
                        {dom.hostname}
                        <ExternalLink className="h-3 w-3 text-[#6B7280]" />
                      </a>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#26292F] border border-[#33373D] font-medium text-xs text-[#D1D5DB]">
                        {dom.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={dom.status} />
                    </td>

                    <td className="py-3.5 px-4 font-mono text-sm">
                      {dom.lastResponseMs ? (
                        <span className="text-emerald-400 font-semibold">{dom.lastResponseMs}ms</span>
                      ) : (
                        <span className="text-[#6B7280]">N/A</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#9CA3AF] text-xs font-mono">
                      {dom.lastCheckedAt ? formatTimeAgo(dom.lastCheckedAt) : 'Never'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        disabled={checkingId === dom.id}
                        onClick={() => handleCheckDomain(dom.id, dom.hostname)}
                        className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-[#26292F] text-[#0B9DF7] font-medium hover:bg-[#33373D] hover:text-white transition-colors border border-[#33373D] disabled:opacity-50"
                      >
                        {checkingId === dom.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Activity className="h-3.5 w-3.5" />
                        )}
                        <span>Ping</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-[#9CA3AF]">
            No domains discovered or matching search query.
          </div>
        )}
      </div>
    </div>
  );
}
