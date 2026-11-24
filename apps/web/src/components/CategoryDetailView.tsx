'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SiteRow } from './SiteRow';
import { PageHeader, DEFAULT_CATEGORY_FILTER_GROUPS } from './PageHeader';

export interface CategoryDetailSite {
  id: string;
  rank?: number;
  name: string;
  displayName?: string | null;
  slug: string;
  faviconUrl?: string | null;
  bestDomainUrl?: string;
  domainsCount?: number;
  domains?: any[];
  createdAt?: string;
  isFeatured?: boolean;
}

export interface CategoryDetailViewProps {
  category: {
    id?: string;
    slug: string;
    name: string;
    iconName?: string | null;
    accentKey?: string | null;
    themeColor?: string | null;
    description?: string | null;
    total?: number;
  };
  sites: CategoryDetailSite[];
}

export function CategoryDetailView({ category, sites }: CategoryDetailViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const initialQ = searchParams?.get('q') || '';
  const initialSort = (searchParams?.get('sort') || 'featured') as
    'featured' | 'starred' | 'newest' | 'az';
  const initialShow = (searchParams?.get('show') || 'all') as 'all' | 'online' | 'mirrors';

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [sortBy, setSortBy] = useState<'featured' | 'starred' | 'newest' | 'az'>(initialSort);
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'mirrors'>(initialShow);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const accentColor = category.themeColor || '#3B82F6';

  // Sync state to URL params (replace without scroll)
  const syncToUrl = useCallback(
    (q: string, sort: string, show: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (sort && sort !== 'featured') params.set('sort', sort);
      if (show && show !== 'all') params.set('show', show);

      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router],
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    syncToUrl(val, sortBy, statusFilter);
  };

  const handleFilterChange = (groupId: string, value: string) => {
    if (groupId === 'sort') {
      const newSort = value as any;
      setSortBy(newSort);
      syncToUrl(searchQuery, newSort, statusFilter);
    } else if (groupId === 'show') {
      const newShow = value as any;
      setStatusFilter(newShow);
      syncToUrl(searchQuery, sortBy, newShow);
    }
  };

  // Filter & sort sites
  const processedSites = useMemo(() => {
    let result = [...sites];

    // 1. Search Query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q) ||
          (s.displayName && s.displayName.toLowerCase().includes(q)),
      );
    }

    // 2. Status Filter
    if (statusFilter === 'mirrors') {
      result = result.filter((s) => (s.domainsCount ?? s.domains?.length ?? 1) > 1);
    }

    // 3. Sorting
    if (sortBy === 'az') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      result.reverse();
    } else if (sortBy === 'starred') {
      result.sort((a, b) => ((b as any).stars || 0) - ((a as any).stars || 0));
    }

    return result;
  }, [sites, searchQuery, sortBy, statusFilter]);

  return (
    <div className="w-full space-y-6">
      {/* 1. Page Header (H1 + count, search + filter dropdown) */}
      <PageHeader
        title={category.name}
        count={category.total ?? sites.length}
        countLabel="websites"
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder={`Search in ${category.name}…`}
        filterGroups={DEFAULT_CATEGORY_FILTER_GROUPS}
        selectedFilters={{
          sort: sortBy,
          show: statusFilter,
        }}
        onFilterChange={handleFilterChange}
      />

      {/* 2. Main Body: Accent-Bordered Category Card with Multi-Column Grid */}
      <div
        className="rounded-[16px] bg-[var(--card,#0A1226)] border p-4 md:p-6 transition-all"
        style={{
          borderColor: `color-mix(in srgb, ${accentColor} 80%, transparent)`,
          boxShadow: `0 0 24px -10px color-mix(in srgb, ${accentColor} 30%, transparent)`,
        }}
      >
        {processedSites.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-fs-base text-[var(--text-2,#A8B3C7)]">
              No websites match your current filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSortBy('featured');
                syncToUrl('', 'featured', 'all');
              }}
              className="text-fs-sm text-[var(--brand-link,#3B82F6)] hover:underline font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Multi-column grid: 3 cols on desktop (>=1280), 2 cols on tablet/laptop, 1 col on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-1.5 items-start">
              {processedSites.map((site, index) => {
                const isExpanded = expandedSlug === site.slug;
                return (
                  <div
                    key={site.id || site.slug || index}
                    className={
                      isExpanded ? 'col-span-1 md:col-span-2 xl:col-span-3 transition-all' : ''
                    }
                  >
                    <SiteRow
                      rank={site.rank ?? index + 1}
                      name={site.name}
                      displayName={site.displayName}
                      slug={site.slug}
                      faviconUrl={site.faviconUrl}
                      bestDomainUrl={site.bestDomainUrl}
                      domainsCount={site.domainsCount ?? site.domains?.length ?? 1}
                      accentColor={accentColor}
                      categoryName={category.name}
                      categorySlug={category.slug}
                      expanded={isExpanded}
                      onToggle={() =>
                        setExpandedSlug((prev) => (prev === site.slug ? null : site.slug))
                      }
                      onExternalClick={(url) => {
                        window.open(url, '_blank');
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Quiet result summary at bottom */}
            <div className="pt-4 mt-4 border-t border-[var(--line,#1A2442)] flex items-center justify-between text-fs-sm text-[var(--text-3,#6B7893)]">
              <span>
                Showing 1–{processedSites.length} of {sites.length}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
