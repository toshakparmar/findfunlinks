'use client';

import React, { useState, useMemo } from 'react';
import { DirectoryCard, WebsiteCardData } from './DirectoryCard';
import { ContentRating } from '@finallinks/contracts';
import { Folder, Search, Shield, Layers } from 'lucide-react';
import { CustomSelect } from './ui/CustomSelect';

export interface CategoryTab {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

interface DirectoryGridProps {
  initialCategories: CategoryTab[];
  websites: WebsiteCardData[];
  searchQuery: string;
}

export function DirectoryGrid({ initialCategories, websites, searchQuery }: DirectoryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'alphabetical'>('popular');
  const [safeOnly, setSafeOnly] = useState<boolean>(true);

  // Filter & sort logic
  const filteredWebsites = useMemo(() => {
    let result = [...websites];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.tagline?.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.categoryName?.toLowerCase().includes(q) ||
          w.tags?.some((t) => t.name.toLowerCase().includes(q)) ||
          w.domains?.some((d) => d.hostname.toLowerCase().includes(q)),
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(
        (w) => w.categorySlug === selectedCategory || w.categoryId === selectedCategory,
      );
    }

    // Safe mode filter (hide MATURE if safeOnly is true)
    if (safeOnly) {
      result = result.filter((w) => w.contentRating !== ContentRating.MATURE);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      // Default: keep existing order
      return 0;
    });

    return result;
  }, [websites, searchQuery, selectedCategory, safeOnly, sortBy]);

  // Categories with count calculation
  const categoriesWithCounts = useMemo(() => {
    return initialCategories.map((cat) => {
      const count = websites.filter(
        (w) =>
          (w.categorySlug === cat.slug || w.categoryId === cat.id) &&
          (!safeOnly || w.contentRating !== ContentRating.MATURE),
      ).length;
      return { ...cat, count };
    });
  }, [initialCategories, websites, safeOnly]);

  const totalVisibleCount = filteredWebsites.length;

  return (
    <section className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground shadow-primary/20 shadow-md scale-102'
              : 'border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>All Categories</span>
          <span
            className={`text-fs-xs px-1.5 py-0.2 rounded-full ${
              selectedCategory === 'all'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {safeOnly
              ? websites.filter((w) => w.contentRating !== ContentRating.MATURE).length
              : websites.length}
          </span>
        </button>

        {categoriesWithCounts.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.slug)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === cat.slug
                ? 'bg-primary text-primary-foreground shadow-primary/20 shadow-md scale-102'
                : 'border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Folder className="h-3.5 w-3.5" />
            <span>{cat.name}</span>
            <span
              className={`text-fs-xs px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.slug
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Control Bar: Total Count + Sort + Safe Search Toggle */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <strong className="text-foreground font-semibold">{totalVisibleCount}</strong>
          <span>verified websites</span>
          {searchQuery && (
            <span className="text-primary font-medium truncate max-w-xs">
              matching &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Safe Mode Toggle */}
          <button
            type="button"
            onClick={() => setSafeOnly(!safeOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              safeOnly
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-border bg-card text-muted-foreground hover:bg-muted'
            }`}
            title={
              safeOnly ? 'Safe mode on: 18+ content hidden' : 'Safe mode off: All content visible'
            }
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Safe Filter: {safeOnly ? 'On' : 'Off'}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 w-44">
            <CustomSelect
              size="sm"
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              options={[
                { value: 'popular', label: 'Most Popular' },
                { value: 'alphabetical', label: 'A – Z' },
                { value: 'newest', label: 'Newest Added' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Directory Grid Display */}
      {filteredWebsites.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWebsites.map((website) => (
            <DirectoryCard key={website.id} website={website} />
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center py-16 px-4 rounded-2xl border border-dashed border-border/80 bg-card/50">
          <Search className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">No websites found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            We couldn&apos;t find any active websites matching your search criteria. Try a different
            term or clear the filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
