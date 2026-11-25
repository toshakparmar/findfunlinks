'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api, getLatencyBadge, formatTimeAgo } from '../lib/api';
import { ReportModal } from './ReportModal';
import { DomainItemData } from './DirectoryCard';
import { DomainStatus, DomainType, ContentRating } from '@finallinks/contracts';
import {
  ExternalLink,
  Copy,
  ShieldCheck,
  Flag,
  Globe,
  Radio,
  Activity,
  ChevronRight,
  Eye,
  Share2,
} from 'lucide-react';

interface WebsiteDetailViewProps {
  website: {
    id: string;
    name: string;
    slug: string;
    tagline?: string | null;
    description: string;
    logoUrl?: string | null;
    coverUrl?: string | null;
    categoryId: string;
    categoryName?: string;
    categorySlug?: string;
    tags?: Array<{ id: string; name: string; slug: string }>;
    language?: string;
    contentRating: ContentRating;
    isFeatured?: boolean;
    viewCount?: number;
    socialLinks?: Record<string, string>;
    domains: DomainItemData[];
  };
}

export function WebsiteDetailView({ website }: WebsiteDetailViewProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedDomainForReport, setSelectedDomainForReport] = useState<
    DomainItemData | undefined
  >(undefined);

  const activeDomains = website.domains.filter((d) => d.status === DomainStatus.ACTIVE);
  const sortedDomains = useMemo(() => {
    return [...website.domains].sort((a, b) => {
      if (a.type === DomainType.PRIMARY && b.type !== DomainType.PRIMARY) return -1;
      if (b.type === DomainType.PRIMARY && a.type !== DomainType.PRIMARY) return 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
  }, [website.domains]);

  const primaryDomain =
    sortedDomains.find((d) => d.type === DomainType.PRIMARY && d.status === DomainStatus.ACTIVE) ||
    activeDomains[0];

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Mirror URL copied to clipboard!');
    } catch {
      toast.error('Failed to copy URL.');
    }
  };

  const handleOpenDomain = (domain: DomainItemData) => {
    api.public.trackDomainClick(domain.id).catch(() => {});
    window.open(domain.url, '_blank');
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${website.name} — Working Mirrors on FinalLinks`,
          text: `Check out ${website.name} and all its working mirrors on FinalLinks!`,
          url: window.location.href,
        });
      } catch {
        // Fallback to copy URL
        handleCopy(window.location.href);
      }
    } else {
      handleCopy(window.location.href);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-muted-foreground mb-6"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        {website.categoryName && (
          <>
            <Link
              href={`/category/${website.categorySlug || 'general'}`}
              className="hover:text-foreground transition-colors"
            >
              {website.categoryName}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground font-semibold truncate">{website.name}</span>
      </nav>

      {/* Website Header Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5 min-w-0">
            {website.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={website.logoUrl}
                alt={`${website.name} logo`}
                className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl object-contain border border-border/80 bg-background/50 p-2 shadow-sm"
              />
            ) : (
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 text-white font-extrabold text-2xl shadow-inner">
                {website.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground truncate">
                  {website.name}
                </h1>
                {website.isFeatured && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-400 border border-brand-orange-500/20">
                    Featured
                  </span>
                )}
                {website.contentRating === ContentRating.MATURE && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    18+ Mature
                  </span>
                )}
              </div>

              {website.tagline && (
                <p className="text-sm font-medium text-muted-foreground">{website.tagline}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                {website.categoryName && (
                  <Link
                    href={`/category/${website.categorySlug}`}
                    className="hover:text-primary transition-colors font-medium text-primary"
                  >
                    📁 {website.categoryName}
                  </Link>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {website.viewCount || 0} visits
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  {activeDomains.length} active mirrors
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDomainForReport(undefined);
                setReportModalOpen(true);
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-brand-flame-500 hover:bg-muted transition-colors shadow-sm"
            >
              <Flag className="h-3.5 w-3.5" />
              Report
            </button>
          </div>
        </div>

        {/* Primary CTA */}
        {primaryDomain && (
          <div className="mt-6 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">Recommended Fast Mirror</p>
                <p className="text-xs font-mono text-muted-foreground">{primaryDomain.hostname}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleCopy(primaryDomain.url)}
                className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Copy primary mirror URL"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleOpenDomain(primaryDomain)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 transition-all active:scale-98"
              >
                <Globe className="h-4 w-4" />
                Open Live Website
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column: Working Mirrors Table & About */}
        <div className="lg:col-span-2 space-y-8">
          {/* Working Mirrors Table */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">
                  All Working Mirrors & Alternative Domains ({website.domains.length})
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">Monitored automatically</span>
            </div>

            {website.domains.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="py-2.5 font-semibold">Status</th>
                      <th className="py-2.5 font-semibold">Mirror / Hostname</th>
                      <th className="py-2.5 font-semibold">Type</th>
                      <th className="py-2.5 font-semibold">Latency</th>
                      <th className="py-2.5 font-semibold">Last Checked</th>
                      <th className="py-2.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {sortedDomains.map((dom) => {
                      const isActive = dom.status === DomainStatus.ACTIVE;
                      const latency = getLatencyBadge(dom.lastResponseMs);

                      return (
                        <tr key={dom.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isActive ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              <span
                                className={
                                  isActive
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }
                              >
                                {isActive ? 'Live' : 'Down'}
                              </span>
                            </span>
                          </td>

                          <td className="py-3 font-mono text-foreground font-medium">
                            <span className="select-all">{dom.hostname}</span>
                            {dom.label && (
                              <span className="block text-fs-xs font-sans text-muted-foreground">
                                {dom.label}
                              </span>
                            )}
                          </td>

                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-fs-xs font-medium bg-muted text-muted-foreground uppercase">
                              {dom.type}
                            </span>
                          </td>

                          <td className="py-3">
                            {dom.lastResponseMs !== null && (
                              <span
                                className={`px-1.5 py-0.5 rounded font-mono text-fs-xs border ${latency.className}`}
                              >
                                {latency.label}
                              </span>
                            )}
                          </td>

                          <td className="py-3 text-muted-foreground">
                            {formatTimeAgo(dom.lastCheckedAt)}
                          </td>

                          <td className="py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleCopy(dom.url)}
                                className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                                title="Copy mirror URL"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDomain(dom)}
                                className="p-1.5 text-primary hover:text-primary/80 rounded transition-colors"
                                title="Open in new tab"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDomainForReport(dom);
                                  setReportModalOpen(true);
                                }}
                                className="p-1.5 text-muted-foreground/60 hover:text-brand-flame-500 rounded transition-colors"
                                title="Report this mirror"
                              >
                                <Flag className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No mirror domains recorded for this website yet.
              </p>
            )}
          </div>

          {/* About & Description */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-foreground">About {website.name}</h2>
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {website.description}
            </div>

            {/* Tags */}
            {website.tags && website.tags.length > 0 && (
              <div className="pt-4 border-t border-border/40">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Tags & Features
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {website.tags.map((t) => (
                    <span
                      key={t.id}
                      className="px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-foreground"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Details & Verification Guarantee */}
        <div className="space-y-6">
          {/* Trust Box */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <ShieldCheck className="h-5 w-5" />
              <span>FinalLinks Guarantee</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every domain listed is continuously checked for DNS availability, HTTP health, and
              safe redirects. Outdated or seized links are promptly flagged and disabled.
            </p>
          </div>

          {/* Metadata Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 text-xs">
            <h3 className="font-semibold text-foreground uppercase tracking-wider text-fs-xs">
              Listing Details
            </h3>

            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium text-foreground">
                {website.categoryName || 'General'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Content Rating</span>
              <span className="font-medium text-foreground">
                {website.contentRating === ContentRating.MATURE ? '18+ Mature' : 'All Ages'}
              </span>
            </div>

            {website.language && (
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium text-foreground">{website.language}</span>
              </div>
            )}

            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Total Mirrors</span>
              <span className="font-medium text-foreground">{website.domains.length} links</span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        websiteId={website.id}
        websiteName={website.name}
        domainId={selectedDomainForReport?.id}
        domainHostname={selectedDomainForReport?.hostname}
      />
    </div>
  );
}
