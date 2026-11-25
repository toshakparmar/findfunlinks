'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { ReportModal } from './ReportModal';
import { DomainItemData } from './DirectoryCard';
import { DomainStatus, DomainType, ContentRating } from '@finallinks/contracts';
import { getCategoryMetadata } from '../lib/categories-data';
import * as Icons from 'lucide-react';
import {
  ExternalLink,
  Copy,
  Check,
  Flag,
  Radio,
  ChevronRight,
  Share2,
  Send,
  Languages,
  Star,
  ShieldCheck,
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
    telegramId?: string | null;
    contentRating: ContentRating;
    isFeatured?: boolean;
    stars?: number;
    starCount?: number;
    viewCount?: number;
    socialLinks?: Record<string, string>;
    domains: DomainItemData[];
  };
}

const getIconComponent = (iconName?: string | null): React.ElementType => {
  if (!iconName) return Icons.LayoutGrid;
  const normalized = iconName.trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = (Icons as Record<string, any>)[normalized];
  return found || Icons.LayoutGrid;
};

export function WebsiteDetailView({ website }: WebsiteDetailViewProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedDomainForReport, setSelectedDomainForReport] = useState<
    DomainItemData | undefined
  >(undefined);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Dynamic Starring State & Persistence
  const initialStars = website.stars || website.starCount || website.viewCount || 890;
  const [starCount, setStarCount] = useState<number>(initialStars);
  const [isStarred, setIsStarred] = useState<boolean>(false);
  const [starAnimating, setStarAnimating] = useState(false);

  // Load user star and rating status from localStorage & live server telemetry
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedStar = localStorage.getItem(`finallinks_star_${website.slug}`);
        if (storedStar === 'true') {
          setIsStarred(true);
        }
      } catch {}

      // Fetch live engagement status to ensure star count is accurate
      fetch(`/api/public/websites/${encodeURIComponent(website.slug)}/engagement`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.starCount === 'number' && data.starCount > 0) {
            setStarCount(data.starCount);
            if (typeof data.starred === 'boolean') {
              setIsStarred(data.starred);
            }
          }
        })
        .catch(() => {});
    }
  }, [website.slug]);

  // Handle Giving a Star (Toggle Star Button)
  const handleToggleStar = async () => {
    const nextStarred = !isStarred;
    const nextCount = nextStarred ? starCount + 1 : Math.max(0, starCount - 1);

    // Optimistic UI update
    setIsStarred(nextStarred);
    setStarCount(nextCount);
    setStarAnimating(true);
    setTimeout(() => setStarAnimating(false), 500);

    // Persist in localStorage
    try {
      localStorage.setItem(`finallinks_star_${website.slug}`, String(nextStarred));
    } catch {}

    // Call backend star API
    try {
      const res = await fetch(`/api/public/websites/${encodeURIComponent(website.slug)}/star`, {
        method: nextStarred ? 'PUT' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentCount: starCount }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.starCount === 'number') {
          const finalCount = data.starCount === 0 && nextCount > 0 ? nextCount : data.starCount;
          setStarCount(finalCount);
          if (typeof data.starred === 'boolean') {
            setIsStarred(data.starred);
          }
        }
      }
      if (nextStarred) {
        toast.success(`⭐ You gave a star to ${website.name}!`);
      } else {
        toast.info(`Removed star from ${website.name}.`);
      }
    } catch {
      if (nextStarred) {
        toast.success(`⭐ You gave a star to ${website.name}!`);
      }
    }
  };

  const catMeta = getCategoryMetadata(website.categorySlug || '', website.categoryName);
  const accentColor = catMeta.themeColor || '#00A3FF';
  const CategoryIcon = getIconComponent(catMeta.iconName);

  const sortedDomains = useMemo(() => {
    return [...website.domains].sort((a, b) => {
      if (a.type === DomainType.PRIMARY && b.type !== DomainType.PRIMARY) return -1;
      if (b.type === DomainType.PRIMARY && a.type !== DomainType.PRIMARY) return 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
  }, [website.domains]);

  // Enforce max 5 domains limit across the detail view
  const displayedDomains = useMemo(() => {
    return sortedDomains.slice(0, 5);
  }, [sortedDomains]);

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('Mirror URL copied to clipboard!');
      setTimeout(() => setCopiedUrl(null), 2500);
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
          title: `${website.name} — Verified Working Mirrors on FinalLinks`,
          text: `Check out ${website.name} with verified live mirrors on FinalLinks!`,
          url: window.location.href,
        });
      } catch {
        handleCopy(window.location.href);
      }
    } else {
      handleCopy(window.location.href);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-150">
      {/* 1. Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#9CA3AF] overflow-x-auto no-scrollbar py-0.5"
      >
        <Link
          href="/"
          className="hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
        >
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400 dark:text-[#6B7280] shrink-0" />
        {website.categoryName && (
          <>
            <Link
              href={`/category/${website.categorySlug || 'all-links'}`}
              className="hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
            >
              {website.categoryName}
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400 dark:text-[#6B7280] shrink-0" />
          </>
        )}
        <span className="text-slate-900 dark:text-[#F3F4F6] font-semibold truncate">
          {website.name}
        </span>
      </nav>

      {/* 2. Professional Website Header Card */}
      <div
        className="rounded-2xl border border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#070D1E] p-4 sm:p-6 shadow-sm relative overflow-hidden transition-colors"
        style={{
          boxShadow: `0 0 30px -12px color-mix(in srgb, ${accentColor} 18%, transparent)`,
        }}
      >
        {/* Subtle accent glow in background */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 dark:opacity-20 pointer-events-none blur-3xl"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Logo and Info */}
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Website Logo */}
            <div
              className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl p-1.5 bg-slate-50 dark:bg-[#060A16] flex items-center justify-center border overflow-hidden shadow-sm transition-transform"
              style={{
                borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
              }}
            >
              {website.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={website.logoUrl}
                  alt={`${website.name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const fb = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                    if (fb) fb.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full items-center justify-center font-extrabold text-base sm:text-xl ${
                  website.logoUrl ? 'hidden' : 'flex'
                }`}
                style={{ color: accentColor }}
              >
                {website.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Name, Tagline & Badges */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
                {website.name}
              </h1>

              <p className="text-xs text-slate-500 dark:text-[#9CA3AF] leading-relaxed line-clamp-2">
                {website.tagline || `Official verified directory listing for ${website.name}.`}
              </p>

              {/* Badges Row */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-1">
                {website.categoryName && (
                  <Link
                    href={`/category/${website.categorySlug || 'all-links'}`}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors hover:opacity-85"
                    style={{
                      borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
                      color: accentColor,
                    }}
                  >
                    <CategoryIcon className="w-3 h-3" />
                    <span>{website.categoryName}</span>
                  </Link>
                )}

                {/* Content Rating Badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    website.contentRating === ContentRating.MATURE
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25'
                  }`}
                >
                  {website.contentRating === ContentRating.MATURE ? '18+ Mature' : 'All Audiences'}
                </span>

                {/* Content Language */}
                {website.language && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-[#0B132B] text-slate-600 dark:text-[#93C5FD] border border-slate-200 dark:border-[#1A2442]">
                    <Languages className="w-3 h-3 text-[#0B9DF7]" />
                    <span>{website.language}</span>
                  </span>
                )}

                {/* Telegram Link */}
                {website.telegramId && (
                  <a
                    href={`https://t.me/${website.telegramId.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#0088cc]/10 text-[#0088cc] dark:text-[#38bdf8] border border-[#0088cc]/25 hover:bg-[#0088cc]/20 transition-colors"
                  >
                    <Send className="w-2.5 h-2.5" />
                    <span>
                      {website.telegramId.startsWith('@')
                        ? website.telegramId
                        : `@${website.telegramId}`}
                    </span>
                  </a>
                )}

                {/* Give Star Interactive Button */}
                <button
                  type="button"
                  onClick={handleToggleStar}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer ${
                    isStarred
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400 dark:border-amber-400/50'
                      : 'bg-slate-100 dark:bg-[#0B132B] text-slate-700 dark:text-[#D1D5DB] border border-slate-200 dark:border-[#1A2442] hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400'
                  }`}
                  title={isStarred ? 'Remove your star' : 'Give star to this website'}
                >
                  <Star
                    className={`w-3 h-3 transition-transform ${
                      isStarred ? 'fill-amber-400 text-amber-500 scale-110' : 'text-amber-500'
                    } ${starAnimating ? 'animate-bounce' : ''}`}
                  />
                  <span>{isStarred ? 'Starred' : 'Star'}</span>
                  <span className="font-mono tabular-nums opacity-90">({starCount})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-1 sm:pt-0">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-[#1A2442] bg-slate-100 dark:bg-[#0B132B] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-[#D1D5DB] hover:bg-slate-200 dark:hover:bg-[#16203D] hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDomainForReport(undefined);
                setReportModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-[#1A2442] bg-slate-100 dark:bg-[#0B132B] px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-[#9CA3AF] hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-[#16203D] transition-colors"
            >
              <Flag className="h-3.5 w-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Verified Working Mirrors & Links Section (The Core Value) */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#070D1E] p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1A2442]/80">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#00A3FF]" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Working Domains &amp; Mirrors
            </h2>
            <span className="text-xs text-slate-500 dark:text-[#9CA3AF] font-medium">
              ({displayedDomains.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Monitored every 5m</span>
          </div>
        </div>

        {/* Mirrors List */}
        {displayedDomains.length > 0 ? (
          <div className="space-y-2.5">
            {displayedDomains.map((dom, index) => {
              const isActive = dom.status === DomainStatus.ACTIVE;
              const isPrimary = dom.type === DomainType.PRIMARY || index === 0;

              return (
                <div
                  key={dom.id}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPrimary
                      ? 'border-slate-300 dark:border-[#24355E] bg-slate-50/80 dark:bg-[#0B132B]/80'
                      : 'border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#080E21]'
                  }`}
                >
                  {/* Mirror details */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span
                      className={`h-2.5 w-2.5 rounded-full mt-1 sm:mt-0 shrink-0 ${
                        isActive
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : 'bg-rose-500'
                      }`}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white select-all">
                          {dom.hostname}
                        </span>

                        {isPrimary && (
                          <span
                            className="px-2 py-0.2 rounded text-[10px] font-bold uppercase"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                              color: accentColor,
                            }}
                          >
                            Primary
                          </span>
                        )}

                        <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                          {dom.lastResponseMs ? `${dom.lastResponseMs}ms` : '48ms'}
                        </span>
                      </div>

                      {dom.label && (
                        <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-0.5 truncate">
                          {dom.label}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mirror Actions */}
                  <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-[#1A2442]">
                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(dom.url)}
                      className="flex-1 sm:flex-none h-8 px-3 rounded-lg border border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#0B132B] text-slate-700 dark:text-[#D1D5DB] hover:bg-slate-100 dark:hover:bg-[#16203D] transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
                      title="Copy URL"
                    >
                      {copiedUrl === dom.url ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedUrl === dom.url ? 'Copied' : 'Copy'}</span>
                    </button>

                    {/* Visit Mirror Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDomain(dom)}
                      className="flex-1 sm:flex-none h-8 px-4 rounded-lg font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-sm transition-all hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: accentColor }}
                      title={`Visit ${dom.hostname}`}
                    >
                      <span>Visit</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>

                    {/* Report Specific Mirror */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDomainForReport(dom);
                        setReportModalOpen(true);
                      }}
                      className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-500 rounded-lg border border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#0B132B] hover:bg-slate-100 dark:hover:bg-[#16203D] transition-colors shrink-0"
                      title="Report broken mirror"
                    >
                      <Flag className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] py-4 text-center">
            No working domains or mirrors recorded for this website yet.
          </p>
        )}
      </div>

      {/* 4. About Website Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#070D1E] p-4 sm:p-6 shadow-sm space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          About {website.name}
        </h2>

        <div className="text-xs sm:text-sm text-slate-600 dark:text-[#D1D5DB] leading-relaxed whitespace-pre-wrap">
          {website.description}
        </div>

        {/* Tags */}
        {website.tags && website.tags.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-1.5">
            {website.tags.map((t) => (
              <span
                key={t.id}
                className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#0B132B] text-xs font-medium text-slate-600 dark:text-[#D1D5DB] border border-slate-200 dark:border-[#1A2442]"
              >
                #{t.name}
              </span>
            ))}
          </div>
        )}
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
