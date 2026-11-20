'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, type OwnerWebsiteDetails, type DomainItem } from '../lib/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatTimeAgo } from '../lib/utils';
import {
  Globe,
  Plus,
  ExternalLink,
  Activity,
  CheckCircle2,
  AlertTriangle,
  MousePointerClick,
  RefreshCw,
  Layers,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function OwnerDashboardPage() {
  const [website, setWebsite] = useState<OwnerWebsiteDetails | null>(null);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [probingId, setProbingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [siteRes, domRes] = await Promise.allSettled([
        api.owner.getWebsite(),
        api.owner.getDomains(),
      ]);

      if (siteRes.status === 'fulfilled') {
        setWebsite(siteRes.value);
      } else {
        setWebsite(null);
      }

      if (domRes.status === 'fulfilled') {
        setDomains(domRes.value);
      } else {
        setDomains([]);
      }
    } catch {
      setWebsite(null);
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProbeDomain = async (domainId: string) => {
    setProbingId(domainId);
    try {
      const updated = await api.owner.checkDomain(domainId);
      toast.success(`Domain tested: ${updated.status} (${updated.lastResponseMs || 0}ms)`);
      setDomains((prev) => prev.map((d) => (d.id === domainId ? updated : d)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Probe check failed.';
      toast.error(message);
    } finally {
      setProbingId(null);
    }
  };

  const activeDomainsCount = domains.filter((d) => d.status === 'ACTIVE').length;
  const downDomainsCount = domains.filter((d) => d.status === 'DOWN').length;
  const totalClicks = domains.reduce((sum, d) => sum + (d.clickCount || 0), 0);

  const publicWebUrl = process.env.NEXT_PUBLIC_PUBLIC_WEB_URL || 'http://localhost:3000';

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#3B82F6]" />
        <p className="text-xs text-[#A8B3C7]">Loading your website dashboard...</p>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="bg-[#0A1226] rounded-3xl border border-[#1A2442] p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center mx-auto text-[#F59E0B]">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-[#F1F5F9]">No Registered Website Assigned</h2>
          <p className="text-xs text-[#A8B3C7] max-w-md mx-auto leading-relaxed">
            Your account is currently not linked to a directory entry. If you recently applied,
            please allow time for Super Admin verification, or submit a new registration from the
            public directory.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#070D1E] border border-[#1A2442] text-xs font-semibold text-[#F1F5F9] hover:bg-[#0E182F] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#3B82F6]" />
            Refresh
          </button>
          <a
            href={`${publicWebUrl}/register`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Submit Registration
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Website Banner Header */}
      <div className="bg-[#0A1226] rounded-3xl border border-[#1A2442] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center font-bold text-xl text-[#3B82F6] overflow-hidden relative flex-shrink-0">
              {website.logoUrl ? (
                <Image src={website.logoUrl} alt={website.name} fill className="object-cover" />
              ) : (
                website.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">
                  {website.name}
                </h1>
                <StatusBadge status={website.status} />
              </div>
              <p className="text-xs text-[#A8B3C7] mt-1 max-w-xl">
                {website.tagline || 'Curated directory entry on FindFunLinks.'}
              </p>
              {website.category && (
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#070D1E] border border-[#1A2442] text-[#F1F5F9]">
                  📁 {website.category.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/domains"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md shadow-[#2563EB]/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Mirror Link
            </Link>
            <a
              href={`${publicWebUrl}/website/${website.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1A2442] bg-[#070D1E] text-[#F1F5F9] hover:bg-[#0E182F] font-semibold text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#3B82F6]" />
              Public View
            </a>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mirrors"
          value={domains.length}
          subtitle="Verified domains & proxies"
          icon={Layers}
          variant="default"
        />
        <StatCard
          title="Active & Healthy"
          value={activeDomainsCount}
          subtitle="Passing live uptime checks"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Offline / Failing"
          value={downDomainsCount}
          subtitle="Failing TCP / HTTP probes"
          icon={AlertTriangle}
          variant={downDomainsCount > 0 ? 'danger' : 'default'}
        />
        <StatCard
          title="Discovery Clicks"
          value={totalClicks}
          subtitle="Direct visitor outbound traffic"
          icon={MousePointerClick}
          variant="default"
        />
      </div>

      {/* Live Mirrors Section */}
      <div className="bg-[#0A1226] rounded-2xl border border-[#1A2442] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#1A2442] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F1F5F9]">
              Configured Mirror Domains ({domains.length})
            </h2>
            <p className="text-xs text-[#A8B3C7] mt-0.5">
              Live link endpoints served to public visitors. When one domain is blocked, visitors
              seamlessly use alternative working mirrors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/domains" className="text-xs font-semibold text-[#3B82F6] hover:underline">
              Manage all mirrors →
            </Link>
          </div>
        </div>

        {domains.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Globe className="w-8 h-8 text-[#6B7893] mx-auto" />
            <p className="text-xs text-[#A8B3C7]">
              No mirror domains added yet. Add your primary URL or alternate links.
            </p>
            <Link
              href="/domains"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white font-semibold text-xs shadow-sm hover:bg-[#1D4ED8]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Mirror
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F1F5F9]">
              <thead className="bg-[#070D1E] text-[11px] uppercase text-[#A8B3C7] border-b border-[#1A2442]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Hostname / URL</th>
                  <th className="py-3 px-4 font-semibold">Mirror Type</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Latency</th>
                  <th className="py-3 px-4 font-semibold">Last Checked</th>
                  <th className="py-3 px-4 font-semibold text-right">Health Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2442]/60">
                {domains.slice(0, 6).map((domain) => (
                  <tr key={domain.id} className="hover:bg-[#0E182F] transition-colors">
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{domain.hostname}</span>
                        {domain.type === 'PRIMARY' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#2563EB]/15 text-[#3B82F6] border border-[#2563EB]/30">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <a
                        href={domain.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#3B82F6] hover:underline flex items-center gap-1 mt-0.5 truncate max-w-xs font-mono"
                      >
                        {domain.url}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={domain.type} type="domainType" />
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={domain.status} />
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {domain.lastResponseMs ? (
                        <span className="text-[#22C55E]">{domain.lastResponseMs}ms</span>
                      ) : (
                        <span className="text-[#6B7893]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#A8B3C7]">
                      {domain.lastCheckedAt ? formatTimeAgo(domain.lastCheckedAt) : 'Never'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleProbeDomain(domain.id)}
                        disabled={probingId === domain.id}
                        className="p-1.5 rounded-lg border border-[#1A2442] bg-[#070D1E] text-[#A8B3C7] hover:text-[#3B82F6] hover:bg-[#0E182F] transition-colors disabled:opacity-50"
                        title="Run health check"
                      >
                        {probingId === domain.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3B82F6]" />
                        ) : (
                          <Activity className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
