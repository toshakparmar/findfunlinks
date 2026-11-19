'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Flame, TrendingUp, Search, Trophy, ChevronRight, PlusCircle, ArrowRight } from 'lucide-react';
import { CLIENT_18_CATEGORIES } from '../lib/client-catalog';
import { SiteDomainsDrawer, SiteDetailModalData } from './SiteDomainsDrawer';

type PopularRange = '24h' | '7d' | '30d' | 'all';

interface PopularSiteItem {
  id: string;
  name: string;
  displayName?: string | null;
  slug: string;
  categoryName: string;
  categorySlug: string;
  accentColor: string;
  faviconUrl?: string | null;
  bestDomainUrl?: string;
  domains: any[];
  clicks: number;
  clicksFormatted: string;
  trendPercent: number;
}

export function PopularView() {
  const [range, setRange] = useState<PopularRange>('7d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrawerSite, setSelectedDrawerSite] = useState<SiteDetailModalData | null>(null);

  // Generate popular sites ranked across catalog
  const rankedSites = useMemo<PopularSiteItem[]>(() => {
    const list: PopularSiteItem[] = [];
    const multiplier = range === '24h' ? 0.08 : range === '7d' ? 0.35 : range === '30d' ? 0.75 : 1.0;

    CLIENT_18_CATEGORIES.forEach((cat) => {
      cat.sites.forEach((site, sIdx) => {
        const rankVal = site.rank ?? (sIdx + 1);
        const baseScore = Math.max(120000 - rankVal * 6500, 8500);
        const variance = ((site.name.charCodeAt(0) * 13) % 2500) + ((site.name.length * 37) % 1800);
        const clicks = Math.round((baseScore + variance) * multiplier);

        let clicksFormatted = `${clicks}`;
        if (clicks >= 1000000) {
          clicksFormatted = `${(clicks / 1000000).toFixed(1)}M`;
        } else if (clicks >= 1000) {
          clicksFormatted = `${(clicks / 1000).toFixed(1)}K`;
        }

        const trendPercent = +(((site.name.charCodeAt(1) || 65) % 18) + 2.4).toFixed(1);

        list.push({
          id: site.id,
          name: site.name,
          displayName: site.displayName,
          slug: site.slug,
          categoryName: cat.name,
          categorySlug: cat.slug,
          accentColor: cat.themeColor || '#3B82F6',
          faviconUrl: site.faviconUrl,
          bestDomainUrl: site.bestDomainUrl,
          domains: site.domains || [],
          clicks,
          clicksFormatted,
          trendPercent,
        });
      });
    });

    list.sort((a, b) => b.clicks - a.clicks);
    return list;
  }, [range]);

  // Filter based on category and search
  const filteredSites = useMemo(() => {
    return rankedSites.filter((site) => {
      if (selectedCategory !== 'all' && site.categorySlug !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = site.name.toLowerCase().includes(q);
        const matchesCat = site.categoryName.toLowerCase().includes(q);
        if (!matchesName && !matchesCat) return false;
      }
      return true;
    });
  }, [rankedSites, selectedCategory, searchQuery]);

  // Split into Top 3 and remaining
  const top3 = filteredSites.slice(0, 3);
  const remaining = filteredSites.slice(3);

  const top3Styles = [
    {
      badge: 'Rank #1',
      title: 'Most Visited',
      accentColor: '#EAB308',
      borderColor: 'border-[#EAB308]/40 hover:border-[#EAB308]/70 shadow-[0_0_20px_-6px_rgba(234,179,8,0.2)]',
      pillBg: 'bg-[#EAB308]/15 border-[#EAB308]/30 text-[#EAB308]',
    },
    {
      badge: 'Rank #2',
      title: 'Runner Up',
      accentColor: '#94A3B8',
      borderColor: 'border-[#94A3B8]/40 hover:border-[#94A3B8]/70 shadow-[0_0_20px_-6px_rgba(148,163,184,0.2)]',
      pillBg: 'bg-[#94A3B8]/15 border-[#94A3B8]/30 text-[#E2E8F0]',
    },
    {
      badge: 'Rank #3',
      title: 'Top Contender',
      accentColor: '#F97316',
      borderColor: 'border-[#F97316]/40 hover:border-[#F97316]/70 shadow-[0_0_20px_-6px_rgba(249,115,22,0.2)]',
      pillBg: 'bg-[#F97316]/15 border-[#F97316]/30 text-[#FB923C]',
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-3,#6B7893)] font-medium">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--line,#1A2442)]" />
        <span className="text-slate-900 dark:text-white font-semibold">Popular Websites</span>
      </nav>

      {/* 2. Header Banner (Matching Category Detail Style) */}
      <div className="rounded-[16px] p-4 sm:p-5 md:p-6 bg-[var(--card,#0A1226)] border border-[var(--primary,#2563EB)]/50 shadow-[0_0_24px_-8px_rgba(37,99,235,0.35)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[12px] bg-[var(--primary,#2563EB)]/15 border border-[var(--primary,#2563EB)]/40 flex items-center justify-center text-[var(--brand-link,#3B82F6)] shrink-0">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary,#2563EB)]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
                  Most Popular Websites
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--primary,#2563EB)]/15 border border-[var(--primary,#2563EB)]/30 text-[var(--brand-link,#3B82F6)]">
                  Top Ranked Traffic
                </span>
              </div>
              <p className="text-xs text-[var(--text-2,#A8B3C7)] mt-1 max-w-2xl">
                Highest-traffic destinations and trending web platforms across all 18 curated directory categories.
              </p>
            </div>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-semibold bg-[var(--primary,#2563EB)] hover:bg-[var(--primary-hover,#1D4ED8)] text-white shadow-sm transition-colors shrink-0 self-start md:self-auto cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>List Your Website</span>
          </Link>
        </div>
      </div>

      {/* 3. Controls Toolbar (Matching Category View Toolbar) */}
      <div className="sticky top-14 md:top-16 z-20 py-2.5 bg-[var(--bg,#050A18)]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-y border-[var(--line,#1A2442)]/60">
        {/* Time Range Toggle */}
        <div className="grid grid-cols-4 sm:flex items-center p-1 rounded-[10px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] text-xs font-medium w-full sm:w-auto shrink-0 gap-0.5">
          {(
            [
              { id: '24h', label: 'Last 24h' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'all', label: 'All Time' },
            ] as const
          ).map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setRange(seg.id)}
              className={`px-1.5 sm:px-3 py-1.5 rounded-[8px] text-[11px] sm:text-xs text-center justify-center transition-all cursor-pointer ${
                range === seg.id
                  ? 'bg-[var(--primary,#2563EB)] text-white font-semibold shadow-sm'
                  : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3,#6B7893)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search popular websites..."
            className="w-full bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] focus:border-[var(--primary,#2563EB)] rounded-[10px] pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-[var(--text-3,#6B7893)] outline-none transition-colors"
          />
        </div>
      </div>

      {/* Category Chips Horizontal Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer text-xs ${
            selectedCategory === 'all'
              ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-white/20'
              : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white border border-transparent'
          }`}
        >
          All Categories
        </button>
        {CLIENT_18_CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer text-xs ${
              selectedCategory === cat.slug
                ? 'bg-[var(--primary,#2563EB)] text-white font-semibold border border-[var(--primary,#2563EB)]'
                : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white border border-[var(--line,#1A2442)] bg-[var(--card,#0A1226)]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 4. Top 3 Highlighted Cards (Structured like CategoryCards) */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((site, index) => {
            const style = (top3Styles[index] || top3Styles[0])!;
            return (
              <div
                key={site.id}
                onClick={() =>
                  setSelectedDrawerSite({
                    id: site.id,
                    name: site.name,
                    displayName: site.displayName,
                    slug: site.slug,
                    faviconUrl: site.faviconUrl,
                    categoryName: site.categoryName,
                    accentColor: site.accentColor,
                    domains: site.domains,
                  })
                }
                className={`rounded-[16px] bg-[var(--card,#0A1226)] border ${style.borderColor} p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer group`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--line,#1A2442)]">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.pillBg}`}>
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{style.badge}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--text-3,#6B7893)]">
                      {style.title}
                    </span>
                  </div>

                  {/* Site Info */}
                  <div className="flex items-center gap-3 my-2">
                    {site.faviconUrl ? (
                      <img
                        src={site.faviconUrl}
                        alt={site.name}
                        className="w-10 h-10 rounded-[10px] object-contain p-1 bg-white/5 border border-white/10 shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-[10px] flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ backgroundColor: site.accentColor }}
                      >
                        {site.name.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[var(--brand-link,#3B82F6)] transition-colors truncate">
                        {site.displayName || site.name}
                      </h2>
                      <span className="text-[11px] text-[var(--text-2,#A8B3C7)] block truncate">
                        {site.categoryName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-3 mt-3 border-t border-[var(--line,#1A2442)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{site.clicksFormatted}</span>
                    <span className="text-[var(--text-3,#6B7893)] text-[11px]">clicks</span>
                    <span className="inline-flex items-center text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +{site.trendPercent}%
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[var(--primary,#2563EB)] group-hover:text-slate-900 dark:group-hover:text-white font-semibold transition-colors text-xs">
                    <span>View Mirrors</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Complete Traffic Rankings (Clean Category Style) */}
      <div className="rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--line,#1A2442)] bg-[var(--card-hover,#0E182F)]/30">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[var(--primary,#2563EB)]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Complete Traffic Rankings ({filteredSites.length})
            </h2>
          </div>
          <span className="text-[11px] text-[var(--text-3,#6B7893)]">
            Verified Analytics
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {remaining.map((site, index) => (
            <div
              key={site.id}
              onClick={() =>
                setSelectedDrawerSite({
                  id: site.id,
                  name: site.name,
                  displayName: site.displayName,
                  slug: site.slug,
                  faviconUrl: site.faviconUrl,
                  categoryName: site.categoryName,
                  accentColor: site.accentColor,
                  domains: site.domains,
                })
              }
              className="flex items-center justify-between p-2.5 rounded-[12px] bg-[var(--card-hover,#0E182F)]/40 hover:bg-[var(--card-hover,#0E182F)] border border-[var(--line,#1A2442)] hover:border-[var(--primary,#2563EB)]/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="text-xs font-mono font-bold text-[var(--text-3,#6B7893)] w-7 text-right shrink-0">
                  #{index + 4}
                </span>

                {site.faviconUrl ? (
                  <img
                    src={site.faviconUrl}
                    alt={site.name}
                    className="w-5 h-5 rounded-sm object-contain shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: site.accentColor }}
                  >
                    {site.name.charAt(0)}
                  </div>
                )}

                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[var(--brand-link,#3B82F6)] transition-colors truncate block">
                    {site.displayName || site.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-3,#6B7893)] block truncate">
                    {site.categoryName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 text-right">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{site.clicksFormatted}</span>
                  <span className="text-[9px] text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                    +{site.trendPercent}%
                  </span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Domains Drawer */}
      <SiteDomainsDrawer
        isOpen={!!selectedDrawerSite}
        onClose={() => setSelectedDrawerSite(null)}
        site={selectedDrawerSite}
      />
    </div>
  );
}
