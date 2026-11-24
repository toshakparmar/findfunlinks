'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Calendar, Sparkles } from 'lucide-react';
import { CLIENT_18_CATEGORIES } from '../lib/client-catalog';
import { PageHeader, FilterGroup } from './PageHeader';
import { SiteRow } from './SiteRow';

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

const NEW_FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'range',
    label: 'Date Range',
    options: [
      { value: 'all', label: 'All recent' },
      { value: 'today', label: 'Added today' },
      { value: 'week', label: 'This week' },
      { value: 'month', label: 'This month' },
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

export function NewView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialRange = (searchParams?.get('range') || 'all') as TimeRange;
  const initialCategory = searchParams?.get('category') || 'all';
  const initialQ = searchParams?.get('q') || '';

  const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const syncToUrl = useCallback(
    (q: string, range: string, category: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (range && range !== 'all') params.set('range', range);
      if (category && category !== 'all') params.set('category', category);

      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router],
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    syncToUrl(val, timeRange, selectedCategory);
  };

  const handleFilterChange = (groupId: string, val: string) => {
    if (groupId === 'range') {
      const newRange = val as TimeRange;
      setTimeRange(newRange);
      syncToUrl(searchQuery, newRange, selectedCategory);
    } else if (groupId === 'category') {
      setSelectedCategory(val);
      syncToUrl(searchQuery, timeRange, val);
    }
  };

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
      {/* 1. Page Header (No banner, no visible breadcrumb) */}
      <PageHeader
        title="Recently Added & Updated"
        count={filteredSites.length}
        countLabel="websites"
        subtitle="Recently added websites and newly verified mirror links"
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search recent additions…"
        filterGroups={NEW_FILTER_GROUPS}
        selectedFilters={{
          range: timeRange,
          category: selectedCategory,
        }}
        onFilterChange={handleFilterChange}
      />

      {/* 2. Grouped Results Cards */}
      {groupedResults.length === 0 ? (
        <div className="rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-[var(--text-3,#6B7893)] mx-auto" />
          <h2 className="text-fs-base font-semibold text-slate-900 dark:text-white">
            No additions match your filter
          </h2>
          <p className="text-fs-sm text-[var(--text-2,#A8B3C7)] max-w-sm mx-auto">
            Try adjusting your time range, category selection, or search query.
          </p>
          <button
            type="button"
            onClick={() => {
              setTimeRange('all');
              setSelectedCategory('all');
              setSearchQuery('');
              syncToUrl('', 'all', 'all');
            }}
            className="inline-flex px-4 py-2 rounded-[10px] text-fs-sm font-semibold bg-[var(--primary,#2563EB)] text-white hover:bg-[var(--primary-hover,#1D4ED8)] cursor-pointer transition-colors"
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
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--line,#1A2442)] bg-[var(--card-hover,#0E182F)]/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary,#2563EB)]/15 border border-[var(--primary,#2563EB)]/30 flex items-center justify-center text-[var(--primary,#2563EB)]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-fs-base font-bold text-slate-900 dark:text-white font-heading">
                      {group.title}
                    </h2>
                    <p className="text-fs-xs text-[var(--text-3,#6B7893)]">{group.subtitle}</p>
                  </div>
                </div>
                <span className="text-fs-xs font-semibold text-slate-700 dark:text-[var(--text-2,#A8B3C7)] bg-slate-100 dark:bg-[var(--line,#1A2442)]/50 px-2.5 py-0.5 rounded-full border border-[var(--line,#1A2442)] tabular-nums">
                  {group.items.length} sites
                </span>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
                {group.items.map((site, idx) => {
                  const isExpanded = expandedSlug === site.slug;
                  return (
                    <div
                      key={site.id || site.slug || idx}
                      className={`rounded-xl border border-[var(--line,#1A2442)] bg-[var(--card-hover,#0E182F)]/40 hover:bg-[var(--card-hover,#0E182F)] hover:border-[var(--primary,#2563EB)]/40 transition-all p-0.5 ${
                        isExpanded ? 'col-span-1 md:col-span-2 xl:col-span-3 ring-1 ring-[var(--primary,#2563EB)]/30' : ''
                      }`}
                    >
                      <SiteRow
                        rank={idx + 1}
                        name={site.name}
                        displayName={site.displayName}
                        slug={site.slug}
                        faviconUrl={site.faviconUrl}
                        bestDomainUrl={site.bestDomainUrl}
                        domainsCount={site.domains?.length || 1}
                        isNew={true}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
