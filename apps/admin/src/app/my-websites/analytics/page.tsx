'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import {
  BarChart3,
  MousePointerClick,
  Activity,
  Layers,
  Eye,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface DomainStat {
  id: string;
  hostname: string;
  label: string | null;
  type: string;
  status: string;
  clickCount: number;
  lastResponseMs?: number | null;
  sharePercentage: number;
}

interface AnalyticsData {
  websiteName: string;
  websiteSlug: string;
  range: string;
  totalClicks: number;
  totalDomains: number;
  onlineDomains: number;
  uptimePercentage: number;
  views: number;
  domains: DomainStat[];
}

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.owner.getAnalytics(timeRange);
      setData(res);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  return (
    <div className="space-y-6 w-full">
      {/* Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">
            Traffic & Mirror Analytics
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Real-time telemetry, outbound visitor discovery clicks, and mirror uptime statistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#1E2024] p-1 rounded-lg border border-[#33373D]">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  timeRange === r
                    ? 'bg-[#0B9DF7] text-white shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                }`}
              >
                {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="h-10 px-3.5 inline-flex items-center gap-2 rounded-lg border border-[#33373D] bg-[#1E2024] text-xs font-semibold text-[#F3F4F6] hover:bg-[#26292F] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0B9DF7]" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0B9DF7]" />
          <p className="text-sm text-[#9CA3AF]">Aggregating mirror analytics telemetry...</p>
        </div>
      ) : !data ? (
        <div className="p-8 max-w-xl mx-auto rounded-xl border border-[#33373D] bg-[#1E2024] text-center space-y-3 mt-12">
          <BarChart3 className="w-10 h-10 text-[#6B7280] mx-auto" />
          <h2 className="text-lg font-bold text-[#F3F4F6]">No Analytics Available</h2>
          <p className="text-sm text-[#9CA3AF]">
            Telemetry data will appear once your website mirror links receive visitor clicks.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Outbound Clicks"
              value={data.totalClicks}
              description={`Visitor clicks over ${timeRange}`}
              icon={MousePointerClick}
              color="blue"
            />
            <StatCard
              title="Overall Uptime"
              value={`${data.uptimePercentage}%`}
              description={`${data.onlineDomains} of ${data.totalDomains} mirrors active`}
              icon={Activity}
              color="emerald"
            />
            <StatCard
              title="Directory Views"
              value={data.views}
              description="Listing impressions on FinalLinks"
              icon={Eye}
              color="orange"
            />
            <StatCard
              title="Active Mirrors"
              value={data.totalDomains}
              description="Configured alternate hostnames"
              icon={Layers}
              color="blue"
            />
          </div>

          {/* Traffic Distribution by Mirror Domain */}
          <div className="bg-[#1E2024] rounded-xl border border-[#33373D] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#F3F4F6]">
                  Mirror Traffic Share ({data.domains.length} Domains)
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Percentage of visitors routed to each mirror or proxy link.
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-[#9CA3AF]">
                Total: {data.totalClicks} clicks
              </span>
            </div>

            {data.domains.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] py-8 text-center">No configured mirrors found.</p>
            ) : (
              <div className="space-y-4">
                {data.domains.map((domain) => (
                  <div key={domain.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-[#F3F4F6]">
                          {domain.hostname}
                        </span>
                        {domain.label && (
                          <span className="text-xs text-[#9CA3AF]">({domain.label})</span>
                        )}
                        <StatusBadge status={domain.type} type="domainType" />
                        <StatusBadge status={domain.status} />
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-[#F3F4F6] font-bold">{domain.clickCount} clicks</span>
                        <span className="text-[#0B9DF7] font-semibold">
                          {domain.sharePercentage}%
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[#16181B] border border-[#33373D]/60 overflow-hidden">
                      <div
                        className="h-full bg-[#0B9DF7] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(domain.sharePercentage, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mirror Latency & Telemetry Table */}
          <div className="bg-[#1E2024] rounded-xl border border-[#33373D] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#33373D]">
              <h2 className="text-base font-bold text-[#F3F4F6]">Live Mirror Performance</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Automated health checks measure TCP and TLS response latencies to route visitors to the fastest mirror.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#F3F4F6]">
                <thead className="bg-[#16181B] text-xs font-semibold uppercase text-[#9CA3AF] border-b border-[#33373D]">
                  <tr>
                    <th className="py-3.5 px-5">Hostname</th>
                    <th className="py-3.5 px-5">Role</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Latency</th>
                    <th className="py-3.5 px-5">Clicks</th>
                    <th className="py-3.5 px-5 text-right">Traffic Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#33373D]/60">
                  {data.domains.map((domain) => (
                    <tr key={domain.id} className="hover:bg-[#26292F] transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs font-medium">
                        {domain.hostname}
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={domain.type} type="domainType" />
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={domain.status} />
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs">
                        {domain.lastResponseMs ? (
                          <span
                            className={
                              domain.lastResponseMs < 500
                                ? 'text-[#22C55E] font-semibold'
                                : domain.lastResponseMs < 1500
                                  ? 'text-[#F59E0B] font-semibold'
                                  : 'text-[#EF4444] font-semibold'
                            }
                          >
                            {domain.lastResponseMs}ms
                          </span>
                        ) : (
                          <span className="text-[#6B7280]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-sm">{domain.clickCount}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-xs text-[#0B9DF7]">
                        {domain.sharePercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
