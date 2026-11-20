'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import { formatTimeAgo } from '../../lib/utils';
import type { DomainItem } from '@findfunlinks/contracts';
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
        for (const site of res.items) {
          const detail = await api.public.getWebsiteBySlug(site.slug).catch(() => null);
          if (detail && detail.domains) {
            extracted.push(...detail.domains);
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
          <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">
            Domains & Working Mirrors
          </h1>
          <p className="text-xs text-[#A8B3C7] mt-1">
            Real-time status inspector for all hostnames, DNS entries, and ping latencies.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDomains}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="h-4 w-4 text-[#6B7893] absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by hostname..."
          className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] pl-9 pr-3.5 py-2 text-xs text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1A2442] bg-[#0A1226] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          </div>
        ) : filteredDomains.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1A2442] bg-[#070D1E] text-[#A8B3C7]">
                  <th className="py-3 px-4 font-semibold">Hostname</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Latency</th>
                  <th className="py-3 px-4 font-semibold">Last Checked</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2442]/60">
                {filteredDomains.map((dom) => (
                  <tr key={dom.id} className="hover:bg-[#0E182F] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#F1F5F9]">
                      <a
                        href={dom.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-[#3B82F6] inline-flex items-center gap-1"
                      >
                        {dom.hostname}
                        <ExternalLink className="h-2.5 w-2.5 text-[#6B7893]" />
                      </a>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-[#070D1E] border border-[#1A2442] font-semibold text-[11px] text-[#A8B3C7]">
                        {dom.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={dom.status} />
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#F1F5F9]">
                      {dom.lastResponseMs ? (
                        <span className="text-[#22C55E]">{dom.lastResponseMs}ms</span>
                      ) : (
                        <span className="text-[#6B7893]">N/A</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#A8B3C7]">
                      {dom.lastCheckedAt ? formatTimeAgo(dom.lastCheckedAt) : 'Never'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        disabled={checkingId === dom.id}
                        onClick={() => handleCheckDomain(dom.id, dom.hostname)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB]/15 text-[#3B82F6] font-semibold hover:bg-[#2563EB] hover:text-white transition-colors border border-[#2563EB]/30 disabled:opacity-50"
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
          <div className="p-12 text-center text-xs text-[#A8B3C7]">
            No domains discovered or matching search query.
          </div>
        )}
      </div>
    </div>
  );
}
