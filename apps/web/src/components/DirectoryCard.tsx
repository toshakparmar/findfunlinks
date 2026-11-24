'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api, getLatencyBadge } from '../lib/api';
import { ReportModal } from './ReportModal';
import { DomainStatus, DomainType, ContentRating } from '@finallinks/contracts';
import { ExternalLink, Copy, ChevronDown, ChevronUp, Flag, Globe } from 'lucide-react';

export interface DomainItemData {
  id: string;
  hostname: string;
  url: string;
  label?: string | null;
  type: DomainType;
  status: DomainStatus;
  lastCheckedAt?: string | null;
  lastResponseMs?: number | null;
  clickCount?: number;
  sortOrder?: number;
}

export interface WebsiteCardData {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description: string;
  logoUrl?: string | null;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  tags?: Array<{ id: string; name: string; slug: string }>;
  contentRating: ContentRating;
  isFeatured?: boolean;
  viewCount?: number;
  activeDomainsCount?: number;
  primaryDomainUrl?: string | null;
  domains?: DomainItemData[];
}

interface DirectoryCardProps {
  website: WebsiteCardData;
}

export function DirectoryCard({ website }: DirectoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeDomainForReport, setActiveDomainForReport] = useState<DomainItemData | undefined>(
    undefined,
  );

  const domains = website.domains || [];
  const sortedDomains = useMemo(() => {
    return [...domains].sort((a, b) => {
      if (a.type === DomainType.PRIMARY && b.type !== DomainType.PRIMARY) return -1;
      if (b.type === DomainType.PRIMARY && a.type !== DomainType.PRIMARY) return 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
  }, [domains]);
  const activeDomains = sortedDomains.filter((d) => d.status === DomainStatus.ACTIVE);
  const primaryDomain =
    sortedDomains.find((d) => d.type === DomainType.PRIMARY && d.status === DomainStatus.ACTIVE) ||
    activeDomains[0];

  const handleCopyLink = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const handleOpenDomain = (domainId: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Fire outbound click tracking asynchronously without blocking navigation
    api.public.trackDomainClick(domainId).catch(() => {});
    window.open(url, '_blank');
  };

  const handleOpenReport = (e: React.MouseEvent, domain?: DomainItemData) => {
    e.stopPropagation();
    setActiveDomainForReport(domain);
    setReportModalOpen(true);
  };

  return (
    <>
      <article className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              {website.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={website.logoUrl}
                  alt={`${website.name} logo`}
                  className="h-10 w-10 shrink-0 rounded-xl object-contain border border-border/80 bg-background/50 p-1"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to avatar letter on load error
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 text-white font-bold text-base shadow-inner">
                  {website.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link
                    href={`/website/${website.slug}`}
                    className="text-base font-bold text-foreground hover:text-primary transition-colors truncate"
                  >
                    {website.name}
                  </Link>
                  {website.isFeatured && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-fs-xs font-semibold bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-400 border border-brand-orange-500/20">
                      Featured
                    </span>
                  )}
                  {website.contentRating === ContentRating.MATURE && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-fs-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      18+
                    </span>
                  )}
                </div>

                {website.categoryName && (
                  <Link
                    href={`/category/${website.categorySlug || 'general'}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors block truncate"
                  >
                    {website.categoryName}
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Report Trigger */}
            <button
              type="button"
              onClick={(e) => handleOpenReport(e)}
              className="text-muted-foreground/60 hover:text-brand-flame-500 transition-colors p-1 rounded-md"
              title="Report broken links or issues"
              aria-label="Report broken links or issues"
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Tagline / Description */}
          {website.tagline && (
            <p className="text-xs font-medium text-foreground/90 line-clamp-1 mb-2">
              {website.tagline}
            </p>
          )}

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
            {website.description}
          </p>

          {/* Tags */}
          {website.tags && website.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {website.tags.slice(0, 4).map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center text-fs-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                >
                  #{t.name}
                </span>
              ))}
              {website.tags.length > 4 && (
                <span className="text-fs-xs text-muted-foreground/80 self-center">
                  +{website.tags.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Working Mirrors Section */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between gap-2">
            {/* Mirror status badge */}
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  activeDomains.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-semibold text-foreground">
                {activeDomains.length} {activeDomains.length === 1 ? 'Live Mirror' : 'Live Mirrors'}
              </span>
            </div>

            {/* Expand / Collapse mirrors button */}
            {domains.length > 1 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
              >
                <span>{expanded ? 'Hide Mirrors' : 'View All'}</span>
                {expanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Quick primary domain button */}
          {primaryDomain && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => handleOpenDomain(primaryDomain.id, primaryDomain.url, e)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-3.5 py-2 text-xs font-bold transition-all shadow-sm active:scale-98 group-hover:bg-primary group-hover:text-primary-foreground"
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{primaryDomain.hostname}</span>
                <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
              </button>

              <button
                type="button"
                onClick={(e) => handleCopyLink(primaryDomain.url, e)}
                className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Copy mirror URL"
                aria-label="Copy mirror URL"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Expanded Mirrors Drawer */}
          {expanded && domains.length > 0 && (
            <div className="mt-3 space-y-1.5 pt-2 border-t border-dashed border-border/60 animate-in fade-in duration-200">
              <p className="text-fs-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                All Verified Links:
              </p>
              {sortedDomains.map((dom) => {
                const latency = getLatencyBadge(dom.lastResponseMs);
                const isActive = dom.status === DomainStatus.ACTIVE;

                return (
                  <div
                    key={dom.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/40 hover:bg-muted text-xs border border-border/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          isActive ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span className="truncate font-mono text-fs-xs text-foreground">
                        {dom.hostname}
                      </span>
                      {dom.type !== DomainType.PRIMARY && (
                        <span className="text-fs-xs px-1 py-0.2 rounded bg-background text-muted-foreground border border-border/60">
                          {dom.type.toLowerCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {dom.lastResponseMs !== null && (
                        <span
                          className={`text-fs-xs px-1.5 py-0.5 rounded font-mono border ${latency.className}`}
                        >
                          {latency.label}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(dom.url, e)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy link"
                      >
                        <Copy className="h-3 w-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenDomain(dom.id, dom.url, e)}
                        className="p-1 text-primary hover:text-primary/80 transition-colors"
                        title="Open link"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </article>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        websiteId={website.id}
        websiteName={website.name}
        domainId={activeDomainForReport?.id}
        domainHostname={activeDomainForReport?.hostname}
      />
    </>
  );
}
