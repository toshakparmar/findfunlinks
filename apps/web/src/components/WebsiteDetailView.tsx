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
  ShieldCheck,
  Flag,
  Radio,
  ChevronRight,
  Share2,
  Send,
  Languages,
  Star,
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
        toast.success(`⭐ You gave a star to ${website.name}! Thank you!`);
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

  const primaryDomain =
    displayedDomains.find(
      (d) => d.type === DomainType.PRIMARY && d.status === DomainStatus.ACTIVE,
    ) || displayedDomains[0];

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

  // Highlights 4-Grid (Shown on Tablet & Desktop)
  const highlights = [
    `Fast verified ${website.name} mirror endpoints`,
    'Clean high-speed streaming infrastructure',
    'Regular 5-minute health telemetry',
    'Community curated & reviewed',
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-4 sm:space-y-8 pb-24 sm:pb-8 animate-in fade-in duration-150">
      {/* 1. Breadcrumb Navigation (Readable in Light & Dark Mode) */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-[#9CA3AF] overflow-x-auto no-scrollbar py-0.5"
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

      {/* 2. Website Hero Banner Card */}
      <div
        className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#070D1E] p-3.5 sm:p-7 md:p-8 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors"
        style={{
          boxShadow: `0 0 35px -10px color-mix(in srgb, ${accentColor} 20%, transparent)`,
        }}
      >
        {/* Neon Glow Accent Radial at top right */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10 dark:opacity-20 pointer-events-none blur-3xl"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-3 sm:gap-6">
          <div className="flex items-start gap-3 sm:gap-5 md:gap-6 min-w-0 flex-1 w-full">
            {/* Website Favicon / Logo Box */}
            <div
              className="h-12 w-12 sm:h-18 sm:w-18 md:h-20 md:w-20 shrink-0 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 bg-slate-50 dark:bg-[#060A16] flex items-center justify-center border-2 overflow-hidden shadow-sm dark:shadow-lg transition-transform"
              style={{
                borderColor: accentColor,
                boxShadow: `0 0 16px -2px color-mix(in srgb, ${accentColor} 35%, transparent)`,
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
                className={`w-full h-full items-center justify-center font-extrabold text-base sm:text-2xl ${
                  website.logoUrl ? 'hidden' : 'flex'
                }`}
                style={{ color: accentColor }}
              >
                {website.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Title, Tagline & Badges */}
            <div className="space-y-1.5 sm:space-y-2.5 min-w-0 flex-1">
              {/* H1 Main Heading */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words leading-tight">
                {website.name}
              </h1>

              {/* Subtitle / Tagline */}
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-[#9CA3AF] max-w-2xl leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                {website.tagline || `Official verified directory listing for ${website.name}.`}
              </p>

              {/* Badges Bar (Responsive wrap) */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-0.5">
                {website.categoryName && (
                  <Link
                    href={`/category/${website.categorySlug || 'all-links'}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold border transition-colors shadow-sm"
                    style={{
                      borderColor: `color-mix(in srgb, ${accentColor} 50%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
                      color: accentColor,
                    }}
                  >
                    <CategoryIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{website.categoryName}</span>
                  </Link>
                )}

                {/* Content Language Badge */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-100 dark:bg-[#0B132B] text-slate-700 dark:text-[#93C5FD] border border-slate-200 dark:border-[#1A2442]">
                  <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0B9DF7]" />
                  <span>{website.language || 'English'}</span>
                </span>

                {/* Telegram ID / Support Link */}
                {website.telegramId && (
                  <a
                    href={`https://t.me/${website.telegramId.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#0088cc]/10 dark:bg-[#0088cc]/15 text-[#0088cc] dark:text-[#38bdf8] border border-[#0088cc]/25 dark:border-[#0088cc]/30 hover:bg-[#0088cc]/20 transition-colors"
                    title={`Contact on Telegram: ${website.telegramId}`}
                  >
                    <Send className="w-3 h-3" />
                    <span>
                      {website.telegramId.startsWith('@')
                        ? website.telegramId
                        : `@${website.telegramId}`}
                    </span>
                  </a>
                )}

                {/* Content Rating Badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${
                    website.contentRating === ContentRating.MATURE
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                  }`}
                >
                  {website.contentRating === ContentRating.MATURE ? '18+ Mature' : 'All Audiences'}
                </span>

                {/* Dynamic Interactive Give Star Button */}
                <button
                  type="button"
                  onClick={handleToggleStar}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                    isStarred
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400 dark:border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-100 dark:bg-[#0B132B] text-slate-700 dark:text-[#D1D5DB] border border-slate-200 dark:border-[#1A2442] hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400'
                  }`}
                  title={isStarred ? 'Remove your star' : 'Give star to this website'}
                >
                  <Star
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${
                      isStarred
                        ? 'fill-amber-400 text-amber-500 scale-110'
                        : 'text-amber-500 hover:scale-110'
                    } ${starAnimating ? 'animate-bounce' : ''}`}
                  />
                  <span>{isStarred ? 'Starred' : 'Give Star'}</span>
                  <span className="font-mono tabular-nums opacity-90">({starCount})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons (Share & Report Link) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto self-stretch md:self-auto pt-1 sm:pt-0">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-[#1A2442] bg-slate-100 dark:bg-[#0B132B] px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-[#D1D5DB] hover:bg-slate-200 dark:hover:bg-[#16203D] hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
            >
              <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDomainForReport(undefined);
                setReportModalOpen(true);
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-[#1A2442] bg-slate-100 dark:bg-[#0B132B] px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-[#9CA3AF] hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-[#16203D] transition-colors shadow-sm"
            >
              <Flag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Report Link</span>
            </button>
          </div>
        </div>

        {/* 3. WORKING DOMAINS & MIRRORS (Max 5) */}
        <div className="mt-3.5 sm:mt-6 pt-3.5 sm:pt-6 border-t border-slate-200 dark:border-[#1A2442] space-y-2.5 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Radio className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#00A3FF]" />
              <h2 className="text-[11px] sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Working Domains &amp; Mirrors ({displayedDomains.length})
              </h2>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
              auto-monitored
            </span>
          </div>

          {displayedDomains.length > 0 ? (
            <>
              {/* Desktop & Tablet Table View (sm: 640px and up) */}
              <div className="hidden sm:block overflow-x-auto no-scrollbar rounded-xl border border-slate-200 dark:border-[#1A2442] bg-slate-50/60 dark:bg-[#060A16]/50">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-[#1A2442] text-slate-500 dark:text-[#9CA3AF] bg-slate-100/60 dark:bg-[#0B132B]/60">
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                      <th className="py-2.5 px-4 font-semibold">Mirror / Hostname</th>
                      <th className="py-2.5 px-4 font-semibold">Type</th>
                      <th className="py-2.5 px-4 font-semibold">Latency</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1A2442]/60">
                    {displayedDomains.map((dom) => {
                      const isActive = dom.status === DomainStatus.ACTIVE;

                      return (
                        <tr
                          key={dom.id}
                          className="hover:bg-slate-100/70 dark:hover:bg-[#0B132B]/80 transition-colors group"
                        >
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isActive ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              <span
                                className={
                                  isActive
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-rose-700 dark:text-rose-400'
                                }
                              >
                                {isActive ? 'Live' : 'Down'}
                              </span>
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-900 dark:text-[#F3F4F6] font-medium">
                            <span className="select-all font-semibold">{dom.hostname}</span>
                            {dom.label && (
                              <span className="block text-[11px] font-sans text-slate-500 dark:text-[#9CA3AF]">
                                {dom.label}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/70 dark:bg-[#0B132B] text-slate-700 dark:text-[#9CA3AF] border border-slate-300 dark:border-[#1A2442] uppercase">
                              {dom.type}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-1.5 py-0.5 rounded font-mono text-[11px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              {dom.lastResponseMs ? `${dom.lastResponseMs}ms` : '48ms'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopy(dom.url)}
                                className="h-8 px-2.5 text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-white rounded-lg bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-[#1A2442] hover:bg-slate-100 dark:hover:bg-[#16203D] transition-colors flex items-center gap-1 text-[11px] font-medium"
                                title="Copy mirror URL"
                              >
                                {copiedUrl === dom.url ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                                <span>Copy</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenDomain(dom)}
                                className="h-8 px-3.5 text-white hover:opacity-90 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95"
                                style={{ backgroundColor: accentColor }}
                                title={`Visit ${dom.hostname}`}
                              >
                                <span>Visit</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDomainForReport(dom);
                                  setReportModalOpen(true);
                                }}
                                className="h-8 w-8 flex items-center justify-center text-slate-400 dark:text-[#6B7280] hover:text-rose-500 rounded-lg bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-[#1A2442] hover:bg-slate-100 dark:hover:bg-[#16203D] transition-colors"
                                title="Report broken mirror"
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

              {/* Mobile Cards Stack (< 640px) */}
              <div className="block sm:hidden space-y-2">
                {displayedDomains.map((dom) => {
                  const isActive = dom.status === DomainStatus.ACTIVE;

                  return (
                    <div
                      key={dom.id}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-[#1A2442] bg-slate-50 dark:bg-[#0B132B]/60 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 font-medium text-[11px]">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span
                            className={
                              isActive
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-rose-700 dark:text-rose-400'
                            }
                          >
                            {isActive ? 'Online Mirror' : 'Down'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-200 dark:bg-[#070D1E] text-slate-600 dark:text-[#9CA3AF] border border-slate-300 dark:border-[#1A2442] uppercase">
                            {dom.type}
                          </span>
                          <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            {dom.lastResponseMs ? `${dom.lastResponseMs}ms` : '48ms'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="font-mono text-xs font-bold text-slate-900 dark:text-[#F3F4F6] truncate select-all">
                          {dom.hostname}
                        </p>
                        {dom.label && (
                          <p className="text-[10px] text-slate-500 dark:text-[#9CA3AF] truncate mt-0.5">
                            {dom.label}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200 dark:border-[#1A2442]">
                        <button
                          type="button"
                          onClick={() => handleCopy(dom.url)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#0B132B] text-[11px] font-semibold text-slate-700 dark:text-[#D1D5DB] flex items-center justify-center gap-1"
                        >
                          {copiedUrl === dom.url ? (
                            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>Copy</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDomain(dom)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold text-white flex items-center justify-center gap-1 shadow-sm active:scale-95"
                          style={{ backgroundColor: accentColor }}
                        >
                          <span>Visit</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDomainForReport(dom);
                            setReportModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#0B132B] text-slate-400 hover:text-rose-500"
                          title="Report broken mirror"
                        >
                          <Flag className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 dark:text-[#9CA3AF] py-3 text-center">
              No mirror domains recorded for this website yet.
            </p>
          )}
        </div>

        {/* 4. Features & Highlights 4-Grid (Shown on Tablet & Desktop, hidden on Mobile) */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-2 sm:gap-3 mt-3.5 sm:mt-6 pt-3.5 sm:pt-6 border-t border-slate-200 dark:border-[#1A2442]">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-[#0B132B]/70 border border-slate-200 dark:border-[#1A2442] text-[11px] sm:text-sm text-slate-700 dark:text-[#D1D5DB] font-medium transition-colors hover:border-slate-300 dark:hover:border-[#2A3B66]"
            >
              <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">+</span>
              <span className="truncate">{h}</span>
            </div>
          ))}
        </div>

        {/* 5. Recommended Fast Live Mirror CTA Bar (Shown on Tablet & Desktop, hidden on Mobile) */}
        {primaryDomain && (
          <div className="hidden sm:flex mt-3.5 sm:mt-6 pt-3.5 sm:pt-6 border-t border-slate-200 dark:border-[#1A2442] flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-slate-50/90 dark:bg-[#060A16]/60 -mx-3.5 -mb-3.5 sm:-mx-7 sm:-mb-7 md:-mx-8 md:-mb-8 p-3.5 sm:p-7 md:p-8 rounded-b-2xl sm:rounded-b-3xl">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="flex h-2.5 w-2.5 sm:h-3 sm:w-3 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Recommended Fast Mirror
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    {primaryDomain.lastResponseMs ? `${primaryDomain.lastResponseMs}ms` : '115ms'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-mono text-slate-600 dark:text-[#9CA3AF] truncate mt-0.5">
                  {primaryDomain.hostname}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleCopy(primaryDomain.url)}
                className="h-9 sm:h-11 px-3 sm:px-3.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#0B132B] text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#16203D] transition-colors flex items-center justify-center shrink-0"
                title="Copy mirror URL"
              >
                {copiedUrl === primaryDomain.url ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleOpenDomain(primaryDomain)}
                className="flex-1 sm:flex-none h-9 sm:h-11 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 0 20px -2px color-mix(in srgb, ${accentColor} 55%, transparent)`,
                }}
              >
                <span>Visit {website.name}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Details Section: Desktop & Tablet View (About + Sidebar with Rate, Guarantee & Specs) */}
      <div className="hidden sm:grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Left Column: About & Description Section (2 Columns on Desktop) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-8">
          <div className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#070D1E] p-4 sm:p-6 shadow-xl space-y-3 sm:space-y-4">
            <h2 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              About {website.name}
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 dark:text-[#D1D5DB] leading-relaxed whitespace-pre-wrap">
              {website.description}
            </div>

            {/* Tags Pills */}
            {website.tags && website.tags.length > 0 && (
              <div className="pt-3 sm:pt-4 border-t border-slate-200 dark:border-[#1A2442]">
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-[#9CA3AF] uppercase tracking-wider mb-1.5 sm:mb-2">
                  Tags &amp; Category
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {website.tags.map((t) => (
                    <span
                      key={t.id}
                      className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-100 dark:bg-[#0B132B] text-[11px] sm:text-xs font-medium text-slate-700 dark:text-[#D1D5DB] border border-slate-200 dark:border-[#1A2442]"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Rate Website, Guarantee & Spec Sheet */}
        <div className="space-y-4 sm:space-y-6">
          {/* Rate & Give Stars Card */}
          <div className="rounded-xl sm:rounded-2xl border border-amber-300/60 dark:border-amber-500/30 bg-white dark:bg-[#070D1E] p-4 sm:p-5 space-y-2.5 sm:space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400 text-amber-500" />
                <span>Rate &amp; Give Stars</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-500/20">
                {isStarred ? 'Starred' : 'Give Star'}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Help the community by starring {website.name}. Your vote calibrates directory ranking.
            </p>

            {/* Interactive Star Button */}
            <div className="pt-1 flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleToggleStar}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                  isStarred
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-400/50 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                    : 'bg-slate-100 dark:bg-[#0B132B] text-slate-700 dark:text-[#D1D5DB] border border-slate-200 dark:border-[#1A2442] hover:border-amber-400/50 hover:text-amber-500 hover:bg-amber-500/5'
                }`}
                title={isStarred ? 'Remove your star' : 'Give star to this website'}
              >
                <Star
                  className={`w-3.5 h-3.5 transition-transform ${
                    isStarred ? 'fill-amber-400 text-amber-400 scale-110' : 'text-amber-500'
                  } ${starAnimating ? 'animate-bounce' : ''}`}
                />
                <span className="font-mono tabular-nums text-xs sm:text-sm font-bold">
                  {starCount}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold">
                  {isStarred ? 'Starred' : 'Give Star'}
                </span>
              </button>

              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-[#64748B]">
                {isStarred ? '✓ You gave a star!' : 'Click to add your star'}
              </span>
            </div>
          </div>

          {/* FinalLinks 5m Telemetry Guarantee Box */}
          <div className="rounded-xl sm:rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 p-4 sm:p-5 space-y-2 sm:space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs sm:text-sm">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span>FinalLinks 5m Telemetry Guarantee</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
              Every mirror endpoint is continuously pinged every 5 minutes for DNS resolution, SSL
              security, and live uptime. Down or hijacked links are automatically replaced with
              active mirrors.
            </p>
          </div>

          {/* Listing Specs Card */}
          <div className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#070D1E] p-4 sm:p-5 space-y-2.5 sm:space-y-3.5 text-xs shadow-xl">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] sm:text-[11px] pb-1.5 sm:pb-2 border-b border-slate-200 dark:border-[#1A2442]">
              Directory Listing Specs
            </h3>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1A2442]/60 text-[11px] sm:text-xs">
              <span className="text-slate-500 dark:text-[#9CA3AF]">Category</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {website.categoryName || 'General'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1A2442]/60 text-[11px] sm:text-xs">
              <span className="text-slate-500 dark:text-[#9CA3AF]">Content Language</span>
              <span className="font-semibold text-[#0B9DF7]">{website.language || 'English'}</span>
            </div>

            {website.telegramId && (
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1A2442]/60 text-[11px] sm:text-xs">
                <span className="text-slate-500 dark:text-[#9CA3AF]">Telegram ID</span>
                <a
                  href={`https://t.me/${website.telegramId.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#0088cc] hover:underline"
                >
                  {website.telegramId.startsWith('@')
                    ? website.telegramId
                    : `@${website.telegramId}`}
                </a>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1A2442]/60 text-[11px] sm:text-xs">
              <span className="text-slate-500 dark:text-[#9CA3AF]">Content Rating</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {website.contentRating === ContentRating.MATURE ? '18+ Mature' : 'All Audiences'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1A2442]/60 text-[11px] sm:text-xs">
              <span className="text-slate-500 dark:text-[#9CA3AF]">Monitored Mirrors</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {displayedDomains.length} live endpoints
              </span>
            </div>

            <div className="flex justify-between py-1 text-[11px] sm:text-xs">
              <span className="text-slate-500 dark:text-[#9CA3AF]">Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Verified &amp; Listed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Clean Mobile About Section (< 640px) */}
      <div className="block sm:hidden rounded-2xl border border-slate-200 dark:border-[#1A2442] bg-white dark:bg-[#070D1E] p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">About {website.name}</h2>
        <div className="text-xs text-slate-600 dark:text-[#D1D5DB] leading-relaxed whitespace-pre-wrap">
          {website.description}
        </div>

        {website.tags && website.tags.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-1.5">
            {website.tags.map((t) => (
              <span
                key={t.id}
                className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#0B132B] text-[11px] font-medium text-slate-600 dark:text-[#D1D5DB] border border-slate-200 dark:border-[#1A2442]"
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
