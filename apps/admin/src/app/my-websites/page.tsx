'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@finallinks/ui';
import { api, type OwnerWebsiteDetails, type DomainItem } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { formatTimeAgo } from '../../lib/utils';
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
  Check,
  ChevronRight,
  LifeBuoy,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MyWebsitesPage() {
  const { user } = useAuth();
  const [website, setWebsite] = useState<OwnerWebsiteDetails | null>(null);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [probingId, setProbingId] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [siteRes, domRes, repRes] = await Promise.allSettled([
        api.owner.getWebsite(),
        api.owner.getDomains(),
        api.owner.getMyReports().catch(() => []),
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

      if (repRes.status === 'fulfilled') {
        setRecentReports(repRes.value.slice(0, 3));
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
      const res = await api.owner.checkDomain(domainId);
      toast.success(
        res.status === 'ACTIVE'
          ? `Domain is online! Response time: ${res.lastResponseMs || 0}ms`
          : `Domain is unreachable (Status: ${res.status})`,
      );
      const updated = await api.owner.getDomains();
      setDomains(updated);
    } catch {
      toast.error('Failed to execute health check probe.');
    } finally {
      setProbingId(null);
    }
  };

  const activeDomainsCount = domains.filter((d) => d.status === 'ACTIVE').length;
  const downDomainsCount = domains.filter((d) => d.status === 'DOWN').length;
  const totalClicks = domains.reduce((acc, curr) => acc + (curr.clickCount || 0), 0);
  const publicWebUrl = process.env.NEXT_PUBLIC_PUBLIC_WEB_URL || 'http://localhost:3000';

  // Checklist items
  const hasChangedPassword = !user?.mustChangePassword;
  const hasProfileFilled = Boolean(website?.tagline && website?.description && website?.logoUrl);
  const hasMultipleMirrors = domains.length >= 2;
  const hasTestedProbe = domains.some((d) => d.lastCheckedAt);
  const completedChecklistCount = [
    hasChangedPassword,
    hasProfileFilled,
    hasMultipleMirrors,
    hasTestedProbe,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#0B9DF7]" />
        <p className="text-sm text-[#9CA3AF] font-medium">Loading your website management portal...</p>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="p-8 max-w-xl mx-auto rounded-xl border border-[#33373D] bg-[#1E2024] text-center space-y-4 mt-12 shadow-sm">
        <div className="w-12 h-12 rounded-lg bg-[#0B9DF7]/15 text-[#0B9DF7] flex items-center justify-center mx-auto border border-[#0B9DF7]/30">
          <Globe className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#F3F4F6]">No Associated Website Found</h2>
          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            Your owner account is not currently linked to an active website entry. If you recently registered,
            please allow time for administrator verification, or submit a new registration.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#16181B] border border-[#33373D] text-sm font-semibold text-[#F3F4F6] hover:bg-[#26292F] transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-[#0B9DF7]" />
            Refresh
          </button>
          <a
            href={`${publicWebUrl}/requests`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#0B9DF7] hover:bg-[#0A8FE0] text-sm font-semibold text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Submit Registration
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Website Banner Header */}
      <div className="bg-[#1E2024] rounded-xl border border-[#33373D] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#0B9DF7]/15 border border-[#0B9DF7]/30 flex items-center justify-center font-bold text-xl text-[#0B9DF7] overflow-hidden relative flex-shrink-0">
              {website.logoUrl ? (
                <img
                  src={website.logoUrl}
                  alt={website.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full items-center justify-center p-2.5 ${website.logoUrl ? 'hidden' : 'flex'}`}>
                <Logo variant="mark" className="w-8 h-8" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">
                  {website.name}
                </h1>
                <StatusBadge status={website.status} />
              </div>
              <p className="text-sm text-[#9CA3AF] mt-1 max-w-xl">
                {website.tagline || 'Curated directory entry on FinalLinks.'}
              </p>
              {website.category && (
                <span className="inline-block mt-2 px-3 py-1 rounded-md text-xs font-semibold bg-[#16181B] border border-[#33373D] text-[#F3F4F6]">
                  {website.category.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <Link
              href="/my-websites/domains"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#0B9DF7] hover:bg-[#0A8FE0] text-white font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Mirror
            </Link>
            <Link
              href="/my-websites/edit"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-[#33373D] bg-[#16181B] text-[#F3F4F6] hover:bg-[#26292F] font-semibold text-sm transition-colors"
            >
              Edit Details
            </Link>
            <a
              href={`${publicWebUrl}/website/${website.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-[#33373D] bg-[#16181B] text-[#F3F4F6] hover:bg-[#26292F] font-semibold text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-[#0B9DF7]" />
              Public View
            </a>
          </div>
        </div>
      </div>

      {/* Onboarding Checklist (shown if any step incomplete) */}
      {completedChecklistCount < 4 && (
        <div className="bg-[#1E2024] rounded-xl border border-[#0B9DF7]/40 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#33373D] pb-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#0B9DF7]" />
              <h2 className="text-base font-bold text-[#F3F4F6]">Owner Onboarding Checklist</h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#0B9DF7]/15 text-[#0B9DF7] border border-[#0B9DF7]/30">
              {completedChecklistCount} of 4 Complete
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Link
              href="/change-password"
              className={`p-3.5 rounded-lg border flex items-start gap-3 transition-colors ${
                hasChangedPassword
                  ? 'border-[#22C55E]/30 bg-[#22C55E]/5 text-[#F3F4F6]'
                  : 'border-[#F59E0B]/30 bg-[#F59E0B]/5 hover:border-[#F59E0B]/50'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  hasChangedPassword
                    ? 'bg-[#22C55E] text-white'
                    : 'border-2 border-[#F59E0B] text-transparent'
                }`}
              >
                {hasChangedPassword && <Check className="w-4 h-4" />}
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#F3F4F6]">Set Permanent Password</p>
                <p className="text-[#9CA3AF] mt-0.5">Replace temporary credentials</p>
              </div>
            </Link>

            <Link
              href="/my-websites/edit"
              className={`p-3.5 rounded-lg border flex items-start gap-3 transition-colors ${
                hasProfileFilled
                  ? 'border-[#22C55E]/30 bg-[#22C55E]/5 text-[#F3F4F6]'
                  : 'border-[#33373D] bg-[#16181B] hover:border-[#4B5563]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  hasProfileFilled
                    ? 'bg-[#22C55E] text-white'
                    : 'border-2 border-[#6B7280] text-transparent'
                }`}
              >
                {hasProfileFilled && <Check className="w-4 h-4" />}
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#F3F4F6]">Complete Listing Profile</p>
                <p className="text-[#9CA3AF] mt-0.5">Upload logo & catchy tagline</p>
              </div>
            </Link>

            <Link
              href="/my-websites/domains"
              className={`p-3.5 rounded-lg border flex items-start gap-3 transition-colors ${
                hasMultipleMirrors
                  ? 'border-[#22C55E]/30 bg-[#22C55E]/5 text-[#F3F4F6]'
                  : 'border-[#33373D] bg-[#16181B] hover:border-[#4B5563]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  hasMultipleMirrors
                    ? 'bg-[#22C55E] text-white'
                    : 'border-2 border-[#6B7280] text-transparent'
                }`}
              >
                {hasMultipleMirrors && <Check className="w-4 h-4" />}
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#F3F4F6]">Add Secondary Mirrors</p>
                <p className="text-[#9CA3AF] mt-0.5">Maintain 2+ alternate URLs</p>
              </div>
            </Link>

            <Link
              href="/my-websites/domains"
              className={`p-3.5 rounded-lg border flex items-start gap-3 transition-colors ${
                hasTestedProbe
                  ? 'border-[#22C55E]/30 bg-[#22C55E]/5 text-[#F3F4F6]'
                  : 'border-[#33373D] bg-[#16181B] hover:border-[#4B5563]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  hasTestedProbe
                    ? 'bg-[#22C55E] text-white'
                    : 'border-2 border-[#6B7280] text-transparent'
                }`}
              >
                {hasTestedProbe && <Check className="w-4 h-4" />}
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#F3F4F6]">Verify Health Probe</p>
                <p className="text-[#9CA3AF] mt-0.5">Trigger live latency check</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mirrors"
          value={domains.length}
          description="Verified domains & proxies"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Active & Healthy"
          value={activeDomainsCount}
          description="Passing live uptime checks"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Offline / Failing"
          value={downDomainsCount}
          description="Failing TCP / HTTP probes"
          icon={AlertTriangle}
          color={downDomainsCount > 0 ? 'rose' : 'blue'}
        />
        <StatCard
          title="Discovery Clicks"
          value={totalClicks}
          description="Direct visitor outbound traffic"
          icon={MousePointerClick}
          color="blue"
        />
      </div>

      {/* Two Column Grid: Top Domains & Support Inquiry Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Mirrors */}
        <div className="lg:col-span-2 bg-[#1E2024] rounded-xl border border-[#33373D] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#33373D] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#F3F4F6]">Top Performing Mirrors</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Visitor distribution across registered hostnames.
              </p>
            </div>
            <Link
              href="/my-websites/analytics"
              className="text-xs font-semibold text-[#0B9DF7] hover:underline flex items-center gap-1"
            >
              Full Analytics <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {domains.length === 0 ? (
            <p className="text-xs text-[#9CA3AF] py-8 text-center">No mirrors configured yet.</p>
          ) : (
            <div className="space-y-3">
              {[...domains]
                .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
                .slice(0, 4)
                .map((d) => {
                  const share =
                    totalClicks > 0
                      ? Math.round(((d.clickCount || 0) / totalClicks) * 100)
                      : 0;
                  return (
                    <div key={d.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-[#F3F4F6]">
                            {d.hostname}
                          </span>
                          <StatusBadge status={d.type} type="domainType" />
                          <StatusBadge status={d.status} />
                        </div>
                        <span className="font-mono font-bold text-[#F3F4F6]">
                          {d.clickCount || 0} clicks ({share}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#16181B] border border-[#33373D]/60 overflow-hidden">
                        <div
                          className="h-full bg-[#0B9DF7] rounded-full"
                          style={{ width: `${Math.max(share, 3)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Support & Operator Inquiries Card */}
        <div className="bg-[#1E2024] rounded-xl border border-[#33373D] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#33373D] pb-3">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-[#0B9DF7]" />
              <h2 className="text-base font-bold text-[#F3F4F6]">Support Inquiries</h2>
            </div>
            <Link
              href="/my-websites/support"
              className="text-xs font-semibold text-[#0B9DF7] hover:underline"
            >
              View all
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-xs text-[#9CA3AF]">No inquiries filed yet.</p>
              <Link
                href="/my-websites/support"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B9DF7] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Need operator help?
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentReports.map((t) => (
                <Link
                  key={t.id}
                  href="/my-websites/support"
                  className="block p-3 rounded-lg bg-[#16181B] border border-[#33373D] hover:border-[#0B9DF7] transition-colors text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#0B9DF7]">
                      [FL-REF-{t.id.slice(0, 6).toUpperCase()}]
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="font-medium text-[#F3F4F6] line-clamp-1">{t.reason}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{formatTimeAgo(t.createdAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Mirrors Section */}
      <div className="bg-[#1E2024] rounded-xl border border-[#33373D] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#33373D] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F3F4F6]">
              Configured Mirror Domains ({domains.length})
            </h2>
            <p className="text-sm text-[#9CA3AF] mt-0.5">
              Live link endpoints served to public visitors. When one domain is blocked, visitors
              seamlessly use alternative working mirrors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/my-websites/domains" className="text-sm font-semibold text-[#0B9DF7] hover:underline">
              Manage all mirrors →
            </Link>
          </div>
        </div>

        {domains.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Globe className="w-8 h-8 text-[#6B7280] mx-auto" />
            <p className="text-sm text-[#9CA3AF]">
              No mirror domains added yet. Add your primary URL or alternate links.
            </p>
            <Link
              href="/my-websites/domains"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#0B9DF7] text-white font-semibold text-sm hover:bg-[#0A8FE0] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Mirror
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#F3F4F6]">
              <thead className="bg-[#16181B] text-xs font-semibold uppercase text-[#9CA3AF] border-b border-[#33373D]">
                <tr>
                  <th className="py-3.5 px-5">Hostname / URL</th>
                  <th className="py-3.5 px-5">Mirror Type</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Latency</th>
                  <th className="py-3.5 px-5">Last Checked</th>
                  <th className="py-3.5 px-5 text-right">Health Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#33373D]/60">
                {domains.slice(0, 6).map((domain) => (
                  <tr key={domain.id} className="hover:bg-[#26292F] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{domain.hostname}</span>
                        {domain.type === 'PRIMARY' && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#0B9DF7]/15 text-[#0B9DF7] border border-[#0B9DF7]/30">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <a
                        href={domain.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#0B9DF7] hover:underline flex items-center gap-1 mt-1 truncate max-w-sm font-mono"
                      >
                        {domain.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    <td className="py-3.5 px-5">
                      <StatusBadge status={domain.type} type="domainType" />
                    </td>

                    <td className="py-3.5 px-5">
                      <StatusBadge status={domain.status} />
                    </td>

                    <td className="py-3.5 px-5 font-mono text-xs">
                      {domain.lastResponseMs ? (
                        <span className="text-[#22C55E] font-semibold">{domain.lastResponseMs}ms</span>
                      ) : (
                        <span className="text-[#6B7280]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-xs text-[#9CA3AF]">
                      {domain.lastCheckedAt ? formatTimeAgo(domain.lastCheckedAt) : 'Never'}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleProbeDomain(domain.id)}
                        disabled={probingId === domain.id}
                        className="p-2 rounded-lg border border-[#33373D] bg-[#16181B] text-[#9CA3AF] hover:text-[#0B9DF7] hover:bg-[#26292F] transition-colors disabled:opacity-50"
                        title="Run health check"
                      >
                        {probingId === domain.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#0B9DF7]" />
                        ) : (
                          <Activity className="w-4 h-4" />
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
