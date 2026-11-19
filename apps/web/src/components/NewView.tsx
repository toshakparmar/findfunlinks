'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, Search, ChevronRight, PlusCircle } from 'lucide-react';
import { CLIENT_18_CATEGORIES } from '../lib/client-catalog';
import { SiteDomainsDrawer, SiteDetailModalData } from './SiteDomainsDrawer';

export const NAV_NEW_LABEL = 'New';

type TimeRange = 'all' | 'today' | 'week' | 'month';

interface NewSiteItem {
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
  addedTimeGroup: 'today' | 'yesterday' | 'week' | 'month';
  addedLabel: string;
}

export function NewView() {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrawerSite, setSelectedDrawerSite] = useState<SiteDetailModalData | null>(null);

  // Generate newly added & updated sites from catalog with realistic dates
  const allNewSites = useMemo<NewSiteItem[]>(() => {
    const list: NewSiteItem[] = [];
    const groups: ('today' | 'yesterday' | 'week' | 'month')[] = [
      'today',
      'today',
      'yesterday',
      'yesterday',
      'yesterday',
      'week',
      'week',
      'week',
      'week',
      'week',
      'month',
      'month',
      'month',
      'month',
      'month',
    ];

    let counter = 0;
    CLIENT_18_CATEGORIES.forEach((cat) => {
      cat.sites.slice(0, 3).forEach((site) => {
        const group: 'today' | 'yesterday' | 'week' | 'month' =
          groups[counter % groups.length] || 'today';
        const addedLabel =
          group === 'today'
            ? 'Added Today'
            : group === 'yesterday'
              ? 'Added Yesterday'
              : group === 'week'
                ? 'Added 4 days ago'
                : 'Added 2 weeks ago';

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
          addedTimeGroup: group,
          addedLabel,
        });
        counter++;
      });
    });

    return list;
  }, []);

  // Filter sites based on time range, category, and search query
  const filteredSites = useMemo(() => {
    return allNewSites.filter((site) => {
      if (timeRange === 'today' && site.addedTimeGroup !== 'today') return false;
      if (
        timeRange === 'week' &&
        site.addedTimeGroup !== 'today' &&
        site.addedTimeGroup !== 'yesterday' &&
        site.addedTimeGroup !== 'week'
      )
        return false;
      if (timeRange === 'month' && site.addedTimeGroup === 'month') return true;

      if (selectedCategory !== 'all' && site.categorySlug !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = site.name.toLowerCase().includes(q);
        const matchesCat = site.categoryName.toLowerCase().includes(q);
        if (!matchesName && !matchesCat) return false;
      }

      return true;
    });
  }, [allNewSites, timeRange, selectedCategory, searchQuery]);

  // Group filtered results by time group
  const groupedResults = useMemo(() => {
    const groups: { title: string; subtitle: string; items: NewSiteItem[] }[] = [];
    const today = filteredSites.filter((s) => s.addedTimeGroup === 'today');
    const yesterday = filteredSites.filter((s) => s.addedTimeGroup === 'yesterday');
    const thisWeek = filteredSites.filter((s) => s.addedTimeGroup === 'week');
    const thisMonth = filteredSites.filter((s) => s.addedTimeGroup === 'month');

    if (today.length > 0) {
      groups.push({
        title: 'Added Today',
        subtitle: 'Freshly listed and verified mirrors',
        items: today,
      });
    }
    if (yesterday.length > 0) {
      groups.push({
        title: 'Added Yesterday',
        subtitle: 'Newly approved directory entries',
        items: yesterday,
      });
    }
    if (thisWeek.length > 0) {
      groups.push({
        title: 'Earlier This Week',
        subtitle: 'Verified within the last 7 days',
        items: thisWeek,
      });
    }
    if (thisMonth.length > 0 && timeRange === 'all') {
      groups.push({ title: 'This Month', subtitle: 'Recent platform additions', items: thisMonth });
    }

    return groups;
  }, [filteredSites, timeRange]);

  return (
    <div className="w-full space-y-6">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-[var(--text-3,#6B7893)] font-medium"
      >
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--line,#1A2442)]" />
        <span className="text-slate-900 dark:text-white font-semibold">New Additions</span>
      </nav>

      {/* 2. Header Banner (Matching Category Detail Style) */}
      <div className="rounded-[16px] p-4 sm:p-5 md:p-6 bg-[var(--card,#0A1226)] border border-[var(--primary,#2563EB)]/50 shadow-[0_0_24px_-8px_rgba(37,99,235,0.35)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[12px] bg-[var(--primary,#2563EB)]/15 border border-[var(--primary,#2563EB)]/40 flex items-center justify-center text-[var(--brand-link,#3B82F6)] shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary,#2563EB)]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
                  Recently Added & Updated
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--primary,#2563EB)]/15 border border-[var(--primary,#2563EB)]/30 text-[var(--brand-link,#3B82F6)]">
                  {filteredSites.length} New Additions
                </span>
              </div>
              <p className="text-xs text-[var(--text-2,#A8B3C7)] mt-1 max-w-2xl">
                Freshly curated websites and newly verified mirror links added to the FindFunLinks
                directory.
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
        {/* Time Segmented Filter */}
        <div className="grid grid-cols-4 sm:flex items-center p-1 rounded-[10px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] text-xs font-medium w-full sm:w-auto shrink-0 gap-0.5">
          {(
            [
              { id: 'all', label: 'All Recent' },
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
            ] as const
          ).map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setTimeRange(seg.id)}
              className={`px-1.5 sm:px-3 py-1.5 rounded-[8px] text-[11px] sm:text-xs text-center justify-center transition-all cursor-pointer ${
                timeRange === seg.id
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
            placeholder="Search recent additions..."
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
          All Categories ({allNewSites.length})
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

      {/* 4. Grouped Results Cards */}
      {groupedResults.length === 0 ? (
        <div className="rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-[var(--text-3,#6B7893)] mx-auto" />
          <h2 className="text-sm font-semibold text-white">No additions match your filter</h2>
          <p className="text-xs text-[var(--text-2,#A8B3C7)] max-w-sm mx-auto">
            Try adjusting your time range, category selection, or search query.
          </p>
          <button
            type="button"
            onClick={() => {
              setTimeRange('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="inline-flex px-4 py-2 rounded-[10px] text-xs font-semibold bg-[var(--primary,#2563EB)] text-white cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedResults.map((group) => (
            <div
              key={group.title}
              className="rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] hover:border-[var(--primary,#2563EB)]/40 transition-all overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--line,#1A2442)] bg-[var(--card-hover,#0E182F)]/30">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                    {group.title}
                  </h2>
                  <p className="text-[11px] text-[var(--text-3,#6B7893)]">{group.subtitle}</p>
                </div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-[var(--text-2,#A8B3C7)] bg-slate-100 dark:bg-[var(--line,#1A2442)]/50 px-2 py-0.5 rounded-full border border-[var(--line,#1A2442)]">
                  {group.items.length} sites
                </span>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {group.items.map((site, idx) => (
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
                    className="flex items-center justify-between p-2.5 rounded-[12px] bg-[var(--card-hover,#0E182F)]/50 hover:bg-[var(--card-hover,#0E182F)] border border-[var(--line,#1A2442)] hover:border-[var(--primary,#2563EB)]/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-[11px] font-mono text-[var(--text-3,#6B7893)] w-5 text-right shrink-0">
                        {idx + 1}.
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[var(--brand-link,#3B82F6)] transition-colors truncate">
                            {site.displayName || site.name}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--primary,#2563EB)]/15 text-[var(--brand-link,#3B82F6)] border border-[var(--primary,#2563EB)]/30">
                            NEW
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--text-3,#6B7893)] block truncate">
                          {site.categoryName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                      <span className="text-[10px] text-[var(--text-3,#6B7893)]">
                        {site.domains?.length || 1}{' '}
                        {site.domains?.length === 1 ? 'link' : 'mirrors'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Domains Drawer */}
      <SiteDomainsDrawer
        isOpen={!!selectedDrawerSite}
        onClose={() => setSelectedDrawerSite(null)}
        site={selectedDrawerSite}
      />
    </div>
  );
}
