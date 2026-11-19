'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, PlusCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { SiteRow } from './SiteRow';
import { SiteDomainsDrawer, SiteDetailModalData } from './SiteDomainsDrawer';
import { CustomSelect } from './ui/CustomSelect';

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

// Map Lucide icons gracefully with fallback
const getIconComponent = (iconName?: string | null): React.ElementType => {
  if (!iconName) return Icons.LayoutGrid;
  const normalized = iconName.trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = (Icons as Record<string, any>)[normalized];
  return found || Icons.LayoutGrid;
};

export function CategoryDetailView({ category, sites }: CategoryDetailViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'newest' | 'az' | 'fastest'>('rank');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'mirrors'>('all');
  const [selectedDrawerSite, setSelectedDrawerSite] = useState<SiteDetailModalData | null>(null);

  const accentColor = category.themeColor || '#3B82F6';
  const IconComponent = getIconComponent(category.iconName);

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
    }

    return result;
  }, [sites, searchQuery, sortBy, statusFilter]);

  const handleOpenDrawer = (site: CategoryDetailSite) => {
    setSelectedDrawerSite({
      id: site.id,
      name: site.name,
      displayName: site.displayName,
      slug: site.slug,
      faviconUrl: site.faviconUrl,
      categoryName: category.name,
      accentColor,
      domains:
        site.domains && site.domains.length > 0
          ? site.domains
          : [
              {
                id: `${site.id}-primary`,
                domainName: site.bestDomainUrl?.replace(/^https?:\/\//, '') || `${site.slug}.com`,
                url: site.bestDomainUrl || `https://${site.slug}.com`,
                domainType: 'PRIMARY',
                status: 'ACTIVE',
                lastResponseMs: 95,
              },
            ],
    });
  };

  return (
    <div className="w-full space-y-5">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-[var(--text-3,#6B7893)] font-medium"
      >
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--line,#1A2442)]" />
        <Link
          href="/categories"
          className="hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Categories
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--line,#1A2442)]" />
        <span className="text-slate-900 dark:text-white font-semibold">{category.name}</span>
      </nav>

      {/* 2. Page Header Banner */}
      <div
        className="rounded-[16px] p-4 sm:p-5 md:p-6 bg-[var(--card,#0A1226)] border transition-all duration-200 relative overflow-hidden"
        style={{
          borderColor: `color-mix(in srgb, ${accentColor} 80%, transparent)`,
          boxShadow: `0 0 28px -8px color-mix(in srgb, ${accentColor} 45%, transparent)`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            {/* Category Icon Badge */}
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-[12px] flex items-center justify-center shrink-0"
              style={{
                background: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
                border: `1.5px solid color-mix(in srgb, ${accentColor} 60%, transparent)`,
                color: accentColor,
              }}
            >
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">
                  {category.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#0A1226] border border-[var(--line,#1A2442)] text-slate-700 dark:text-[var(--text-2,#A8B3C7)]">
                  {category.total ?? sites.length} Sites
                </span>
              </div>
              <p className="text-xs md:text-sm text-[var(--text-2,#A8B3C7)] mt-1 max-w-2xl">
                {category.description ||
                  `Verified directory of official ${category.name} websites and working mirrors.`}
              </p>
            </div>
          </div>

          {/* Quick Stats or CTA */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-semibold bg-[var(--primary,#2563EB)] text-white shadow-sm hover:bg-[var(--primary-hover,#1D4ED8)] transition-all select-none"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List Website</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Sticky Filter Toolbar */}
      <div className="sticky top-14 md:top-16 z-20 py-2.5 bg-[var(--bg,#050A18)]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-y border-[var(--line,#1A2442)]/60">
        {/* Search within category */}
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="w-4 h-4 text-[var(--text-3,#6B7893)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${category.name}...`}
            className="w-full bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] focus:border-[var(--primary,#2563EB)] rounded-[10px] pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-[var(--text-3,#6B7893)] focus:outline-none transition-colors"
          />
        </div>

        {/* Sort & Status Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto text-xs">
          {/* Status Segmented Filter */}
          <div className="flex items-center bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] rounded-[10px] p-0.5">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-[8px] font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[var(--primary,#2563EB)] text-white shadow-sm'
                  : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('mirrors')}
              className={`px-2.5 py-1 rounded-[8px] font-medium transition-colors ${
                statusFilter === 'mirrors'
                  ? 'bg-[var(--primary,#2563EB)] text-white shadow-sm'
                  : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Has Mirrors
            </button>
          </div>

          {/* Sort Select */}
          <CustomSelect
            size="sm"
            className="w-36"
            value={sortBy}
            onChange={(val) => setSortBy(val as any)}
            options={[
              { value: 'rank', label: 'Popular Rank' },
              { value: 'az', label: 'A – Z' },
              { value: 'newest', label: 'Newest First' },
            ]}
          />
        </div>
      </div>

      {/* 4. Main Body: Wide Category Card with 3 Columns on Desktop */}
      <div
        className="rounded-[16px] bg-[var(--card,#0A1226)] border p-4 md:p-6 transition-all"
        style={{
          borderColor: `color-mix(in srgb, ${accentColor} 80%, transparent)`,
          boxShadow: `0 0 24px -10px color-mix(in srgb, ${accentColor} 30%, transparent)`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 mb-4 border-b border-[var(--line,#1A2442)]">
          <span className="text-xs font-semibold text-[var(--text-2,#A8B3C7)]">
            Showing {processedSites.length} of {sites.length} sites
          </span>
          <span className="text-[11px] text-[var(--text-3,#6B7893)] hidden sm:inline">
            Click row for mirrors · Click icon to open
          </span>
        </div>

        {processedSites.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm text-[var(--text-2,#A8B3C7)]">
              No websites match your current filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="text-xs text-[var(--brand-link,#3B82F6)] hover:underline font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Multi-column grid: 3 cols on desktop (>=1280), 2 cols on tablet/laptop, 1 col on mobile */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-1">
            {processedSites.map((site, index) => (
              <SiteRow
                key={site.id || index}
                rank={site.rank ?? index + 1}
                name={site.name}
                displayName={site.displayName}
                slug={site.slug}
                faviconUrl={site.faviconUrl}
                bestDomainUrl={site.bestDomainUrl}
                domainsCount={site.domainsCount ?? site.domains?.length ?? 1}
                accentColor={accentColor}
                onClick={() => handleOpenDrawer(site)}
                onExternalClick={(url) => {
                  window.open(url, '_blank', 'noopener,noreferrer,nofollow');
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Working Mirrors Drawer */}
      <SiteDomainsDrawer
        isOpen={!!selectedDrawerSite}
        onClose={() => setSelectedDrawerSite(null)}
        site={selectedDrawerSite}
      />
    </div>
  );
}
