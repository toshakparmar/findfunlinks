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
      const [siteRes, domRes] = await Promise.all([api.owner.getWebsite(), api.owner.getDomains()]);
      setWebsite(siteRes);
      setDomains(domRes);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load website details.';
      toast.error(message);
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
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-xs text-neutral-500">Loading your website dashboard...</p>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          No Registered Website Assigned
        </h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Your account is currently not linked to a directory entry. If you recently applied, please
          allow time for Super Admin verification.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Website Banner Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-xl text-blue-600 overflow-hidden relative flex-shrink-0">
              {website.logoUrl ? (
                <Image src={website.logoUrl} alt={website.name} fill className="object-cover" />
              ) : (
                website.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
                  {website.name}
                </h1>
                <StatusBadge status={website.status} />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">
                {website.tagline || 'Curated directory entry on FindFunLinks.'}
              </p>
              {website.category && (
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  📁 {website.category.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/domains"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Mirror Link
            </Link>
            <a
              href={`${publicWebUrl}/website/${website.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 font-semibold text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
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
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Configured Mirror Domains ({domains.length})
            </h2>
            <p className="text-xs text-neutral-400">
              Live link endpoints served to public visitors. When one domain is blocked, visitors
              seamlessly use alternative working mirrors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/domains"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage all mirrors →
            </Link>
          </div>
        </div>

        {domains.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Globe className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="text-xs text-neutral-500">
              No mirror domains added yet. Add your primary URL or alternate links.
            </p>
            <Link
              href="/domains"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-sm hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Mirror
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-xs uppercase text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Hostname / URL</th>
                  <th className="py-3 px-4 font-semibold">Mirror Type</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Latency</th>
                  <th className="py-3 px-4 font-semibold">Last Checked</th>
                  <th className="py-3 px-4 font-semibold text-right">Health Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {domains.slice(0, 6).map((domain) => (
                  <tr
                    key={domain.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
                          <Globe className="w-3.5 h-3.5 text-blue-500" />
                          {domain.hostname}
                        </span>
                        <a
                          href={domain.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-neutral-400 hover:text-blue-500 truncate max-w-xs block mt-0.5"
                        >
                          {domain.url}
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={domain.type} type="domainType" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={domain.status} />
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-neutral-500">
                      {domain.lastResponseMs !== undefined && domain.lastResponseMs !== null ? (
                        <span
                          className={
                            domain.lastResponseMs < 500
                              ? 'text-emerald-600 font-semibold'
                              : domain.lastResponseMs < 1500
                                ? 'text-amber-600'
                                : 'text-rose-600'
                          }
                        >
                          {domain.lastResponseMs}ms
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-400 whitespace-nowrap">
                      {formatTimeAgo(domain.lastCheckedAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleProbeDomain(domain.id)}
                        disabled={probingId === domain.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                      >
                        <Activity
                          className={`w-3.5 h-3.5 ${
                            probingId === domain.id ? 'animate-spin text-blue-500' : ''
                          }`}
                        />
                        {probingId === domain.id ? 'Probing...' : 'Probe Live'}
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
