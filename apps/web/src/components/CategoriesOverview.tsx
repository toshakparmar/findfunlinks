'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { CatalogCategory } from '../lib/client-catalog';

export interface CategoriesOverviewProps {
  categories: CatalogCategory[];
  totalCategories: number;
  totalSites: number;
}

const getIconComponent = (iconName?: string | null): React.ElementType => {
  if (!iconName) return Icons.LayoutGrid;
  const normalized = iconName.trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = (Icons as Record<string, any>)[normalized];
  return found || Icons.LayoutGrid;
};

export const CategoriesOverview: React.FC<CategoriesOverviewProps> = ({
  categories,
  totalCategories,
  totalSites,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.sites.some((s) => s.name.toLowerCase().includes(q)),
    );
  }, [categories, searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--line,#1A2442)]">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">
            All Categories
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-2,#A8B3C7)] mt-1">
            Browse {totalSites} curated websites across {totalCategories} categories with verified
            live mirrors.
          </p>
        </div>

        {/* Category Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[var(--text-3,#6B7893)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories or sites..."
            className="w-full bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] focus:border-[var(--primary,#2563EB)] rounded-[12px] pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-[var(--text-3,#6B7893)] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* 2. Grid of Category Tiles */}
      {filteredCategories.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-[var(--text-2,#A8B3C7)]">
            No categories match &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs text-[var(--brand-link,#3B82F6)] hover:underline font-semibold"
          >
            Reset search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const accentColor = cat.themeColor || '#3B82F6';
            const IconComp = getIconComponent(cat.iconName);
            const topFavicons = cat.sites.slice(0, 4).filter((s) => s.faviconUrl);

            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group relative flex flex-col justify-between p-4 rounded-[16px] bg-[var(--card,#0A1226)] border transition-all duration-200 hover:scale-[1.01] hover:brightness-105 cursor-pointer select-none"
                style={{
                  borderColor: `color-mix(in srgb, ${accentColor} 70%, transparent)`,
                  boxShadow: `0 0 20px -8px color-mix(in srgb, ${accentColor} 30%, transparent)`,
                }}
              >
                <div>
                  {/* Top: Icon + Count */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
                        border: `1.5px solid color-mix(in srgb, ${accentColor} 60%, transparent)`,
                        color: accentColor,
                      }}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-[#0A1226] border border-[var(--line,#1A2442)] text-slate-700 dark:text-[var(--text-2,#A8B3C7)]">
                      {cat.total ?? cat.sites.length} Sites
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading group-hover:text-[var(--primary,#2563EB)] transition-colors truncate">
                    {cat.name}
                  </h2>
                  <p className="text-[11px] text-[var(--text-2,#A8B3C7)] mt-1 line-clamp-1">
                    Top links:{' '}
                    {cat.sites
                      .slice(0, 3)
                      .map((s) => s.name)
                      .join(', ')}
                  </p>
                </div>

                {/* Bottom: Overlapping Favicons + Arrow */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--line,#1A2442)]">
                  {/* Overlapping top favicons */}
                  <div className="flex items-center -space-x-1.5">
                    {topFavicons.map((site, i) => (
                      <div
                        key={site.id || i}
                        className="w-6 h-6 rounded-full bg-[var(--line,#1A2442)] border-2 border-[var(--card,#0A1226)] overflow-hidden flex items-center justify-center"
                        title={site.name}
                      >
                        <img
                          src={site.faviconUrl!}
                          alt=""
                          width={24}
                          height={24}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Arrow Indicator */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-transform group-hover:translate-x-1"
                    style={{
                      background: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
                      color: accentColor,
                    }}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
