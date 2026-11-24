'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Trophy,
  Star,
} from 'lucide-react';
import { api } from '../lib/api';
import { CLIENT_18_CATEGORIES } from '../lib/client-catalog';
import { PageHeader, FilterGroup } from './PageHeader';
import { SiteRow } from './SiteRow';

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
  stars: number;
  clicks: number;
  clicksFormatted: string;
  trendPercent: number;
}

const POPULAR_FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'range',
    label: 'Time Range',
    options: [
      { value: 'all', label: 'All time' },
      { value: '30d', label: 'Last 30 days' },
      { value: '7d', label: 'Last 7 days' },
      { value: '24h', label: 'Last 24 hours' },
    ],
  },
  {
    id: 'category',
    label: 'Category',
    options: [
      { value: 'all', label: 'All categories' },
      ...CLIENT_18_CATEGORIES.map((cat) => ({
        value: cat.slug,
        label: cat.name,
      })),
    ],
  },
];

export function PopularView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialRange = (searchParams?.get('range') || '7d') as PopularRange;
  const initialCategory = searchParams?.get('category') || 'all';
  const initialQ = searchParams?.get('q') || '';

  const [range, setRange] = useState<PopularRange>(initialRange);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [liveWebsites, setLiveWebsites] = useState<any[]>([]);

  const syncToUrl = useCallback(
    (q: string, rng: string, category: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (rng && rng !== '7d') params.set('range', rng);
      if (category && category !== 'all') params.set('category', category);

      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router],
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    syncToUrl(val, range, selectedCategory);
  };

  const handleFilterChange = (groupId: string, val: string) => {
    if (groupId === 'range') {
      const newRange = val as PopularRange;
      setRange(newRange);
      syncToUrl(searchQuery, newRange, selectedCategory);
    } else if (groupId === 'category') {
      setSelectedCategory(val);
      syncToUrl(searchQuery, range, val);
    }
  };

  useEffect(() => {
    api.public
      .getWebsitesGrouped()
      .then((res: any) => {
        if (Array.isArray(res)) {
          const allSites: any[] = [];
          res.forEach((group: any) => {
            if (group.websites && Array.isArray(group.websites)) {
              group.websites.forEach((w: any) => {
                allSites.push({
                  ...w,
                  categoryName: group.category?.name || 'Curated',
                  categorySlug: group.category?.slug || 'curated',
                  accentColor: '#3B82F6',
                });
              });
            }
          });
          if (allSites.length > 0) setLiveWebsites(allSites);
        }
      })
      .catch(() => {});
  }, []);

  // Generate popular sites ranked across catalog
  const rankedSites = useMemo<PopularSiteItem[]>(() => {
    const list: PopularSiteItem[] = [];
    const multiplier =
      range === '24h' ? 0.08 : range === '7d' ? 0.35 : range === '30d' ? 0.75 : 1.0;

    CLIENT_18_CATEGORIES.forEach((cat) => {
      cat.sites.forEach((site, sIdx) => {
        const rankVal = site.rank ?? sIdx + 1;
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
          stars: 0,
          clicks,
          clicksFormatted,
          trendPercent,
        });
      });
    });

    // Merge live database websites and their stars
    liveWebsites.forEach((w) => {
      const existingIdx = list.findIndex((s) => s.slug === w.slug || s.id === w.id);
      const stars = typeof w.stars === 'number' ? w.stars : 0;
      const clicks = (w.viewCount || 0) + stars * 100;
      const item: PopularSiteItem = {
        id: w.id,
        name: w.name,
        displayName: w.name,
        slug: w.slug,
        categoryName: w.categoryName || 'Curated',
        categorySlug: w.categorySlug || 'curated',
        accentColor: '#3B82F6',
        faviconUrl: w.logoUrl,
        bestDomainUrl: w.domains?.[0]?.url,
        domains: w.domains || [],
        stars,
        clicks,
        clicksFormatted: clicks >= 1000 ? `${(clicks / 1000).toFixed(1)}K` : `${clicks}`,
        trendPercent: 14.8,
      };

      if (existingIdx !== -1 && list[existingIdx]) {
        list[existingIdx] = {
          ...list[existingIdx]!,
          ...item,
          stars: Math.max(list[existingIdx]!.stars || 0, stars),
        };
      } else {
        list.unshift(item);
      }
    });

    list.sort((a, b) => {
      // Sort primarily by stars (highest stars first)
      if ((b.stars || 0) !== (a.stars || 0)) {
        return (b.stars || 0) - (a.stars || 0);
      }
      return b.clicks - a.clicks;
    });
    return list;
  }, [range, liveWebsites]);

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
      borderColor:
        'border-[#EAB308]/40 hover:border-[#EAB308]/70 shadow-[0_0_20px_-6px_rgba(234,179,8,0.2)]',
      pillBg: 'bg-[#EAB308]/15 border-[#EAB308]/30 text-[#EAB308]',
    },
    {
      badge: 'Rank #2',
      title: 'Runner Up',
      accentColor: '#94A3B8',
      borderColor:
        'border-[#94A3B8]/40 hover:border-[#94A3B8]/70 shadow-[0_0_20px_-6px_rgba(148,163,184,0.2)]',
      pillBg: 'bg-[#94A3B8]/15 border-[#94A3B8]/30 text-[#E2E8F0]',
    },
    {
      badge: 'Rank #3',
      title: 'Top Contender',
      accentColor: '#F97316',
      borderColor:
        'border-[#F97316]/40 hover:border-[#F97316]/70 shadow-[0_0_20px_-6px_rgba(249,115,22,0.2)]',
      pillBg: 'bg-[#F97316]/15 border-[#F97316]/30 text-[#FB923C]',
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 1. Page Header (No banner, no visible breadcrumb) */}
      <PageHeader
        title="Most Popular Websites"
        count={filteredSites.length}
        countLabel="websites"
        subtitle="Ranked by community stars and overall visitor popularity"
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search popular websites…"
        filterGroups={POPULAR_FILTER_GROUPS}
        selectedFilters={{
          range,
          category: selectedCategory,
        }}
        onFilterChange={handleFilterChange}
      />

      {/* 2. Top 3 Spotlight Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((site, index) => {
            const style = top3Styles[index] ?? top3Styles[0]!;
            return (
              <div
                key={site.id}
                onClick={() => router.push(`/site/${site.slug}`)}
                className={`relative rounded-[16px] bg-[var(--card,#0A1226)] border ${style.borderColor} p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-fs-xs font-semibold border ${style.pillBg}`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{style.badge}</span>
                  </span>
                  <span className="text-fs-xs text-[var(--text-3,#6B7893)]">{site.categoryName}</span>
                </div>

                <div className="flex items-center gap-3">
                  {site.faviconUrl ? (
                    <img
                      src={site.faviconUrl}
                      alt={site.name}
                      className="w-10 h-10 rounded-[8px] object-contain shrink-0 bg-[var(--card-hover,#0E182F)] p-1 border border-[var(--line,#1A2442)]"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-[8px] flex items-center justify-center text-fs-md font-bold text-white shrink-0"
                      style={{ backgroundColor: style.accentColor }}
                    >
                      {site.name.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-fs-base font-bold text-slate-900 dark:text-white truncate group-hover:text-[var(--brand-link,#3B82F6)] transition-colors">
                      {site.displayName || site.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {site.stars > 0 && (
                        <span className="inline-flex items-center gap-1 text-fs-xs font-semibold text-amber-400 tabular-nums">
                          <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                          <span>{site.stars}</span>
                        </span>
                      )}
                      <span className="text-fs-xs text-[var(--text-2,#A8B3C7)] tabular-nums">
                        {site.clicksFormatted} views
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Numbered Ranking List */}
      <div className="rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] p-4 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-2 items-start">
          {(top3.length === 0 ? filteredSites : remaining).map((site, index) => {
            const actualRank = (top3.length === 0 ? 0 : 3) + index + 1;
            const isExpanded = expandedSlug === site.slug;
            return (
              <div
                key={site.id || site.slug || index}
                className={isExpanded ? 'col-span-1 md:col-span-2 xl:col-span-3 transition-all' : ''}
              >
                <SiteRow
                  rank={actualRank}
                  name={site.name}
                  displayName={site.displayName}
                  slug={site.slug}
                  faviconUrl={site.faviconUrl}
                  bestDomainUrl={site.bestDomainUrl}
                  domainsCount={site.domains?.length || 1}
                  accentColor={site.accentColor || '#2563EB'}
                  categoryName={site.categoryName}
                  categorySlug={site.categorySlug}
                  expanded={isExpanded}
                  onToggle={() => setExpandedSlug((prev) => (prev === site.slug ? null : site.slug))}
                  onExternalClick={(url) => {
                    window.open(url, '_blank');
                  }}
                />
              </div>
            );
          })}
        </div>

        {filteredSites.length === 0 && (
          <div className="py-16 text-center space-y-2">
            <p className="text-fs-base text-[var(--text-2,#A8B3C7)]">
              No popular websites found matching your filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setRange('7d');
                syncToUrl('', '7d', 'all');
              }}
              className="text-fs-sm text-[var(--brand-link,#3B82F6)] hover:underline font-medium"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
