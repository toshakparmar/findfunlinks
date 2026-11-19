'use client';

import React from 'react';
import { SiteRow } from './SiteRow';
import { ViewMoreButton } from './ViewMoreButton';
import * as Icons from 'lucide-react';

export interface CategoryCardData {
  id?: string;
  slug: string;
  name: string;
  iconName?: string | null;
  accentKey?: string | null;
  themeColor?: string | null;
  total?: number;
  homeLimit?: number;
}

export interface CategoryCardSiteItem {
  id: string;
  rank?: number;
  name: string;
  displayName?: string | null;
  slug: string;
  faviconUrl?: string | null;
  bestDomainUrl?: string;
  domainsCount?: number;
}

export interface CategoryCardProps {
  category: CategoryCardData;
  sites: CategoryCardSiteItem[];
  onSelectSite?: (site: CategoryCardSiteItem) => void;
  onExternalClick?: (url: string, site: CategoryCardSiteItem) => void;
  className?: string;
}

// Map Lucide icons gracefully with fallback
const getIconComponent = (iconName?: string | null): React.ElementType => {
  if (!iconName) return Icons.LayoutGrid;
  const normalized = iconName.trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = (Icons as Record<string, any>)[normalized];
  return found || Icons.LayoutGrid;
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  sites,
  onSelectSite,
  onExternalClick,
  className = '',
}) => {
  const accentColor = category.themeColor || 'var(--accent-purple, #8B5CF6)';
  const IconComponent = getIconComponent(category.iconName);
  const count = category.total ?? sites.length;

  // Split into 2 columns on mobile (1-8 left, 9-15 right)
  const leftColSites = sites.slice(0, 8);
  const rightColSites = sites.slice(8, 15);

  return (
    <div
      className={`cat-card flex flex-col justify-between p-3.5 md:p-4 rounded-[16px] bg-[var(--card,#0A1226)] transition-all duration-200 relative overflow-hidden ${className}`}
      style={
        {
          '--accent': accentColor,
          borderColor: `color-mix(in srgb, ${accentColor} 85%, transparent)`,
          boxShadow: `0 0 0 1px color-mix(in srgb, ${accentColor} 18%, transparent), 0 0 28px -8px color-mix(in srgb, ${accentColor} 45%, transparent)`,
        } as React.CSSProperties
      }
    >
      <div>
        {/* Card Header Row */}
        <div
          className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--line,#1A2442)]"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 14%, transparent), transparent)`,
            margin: '-14px -14px 10px -14px',
            padding: '12px 14px 10px 14px',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Icon Chip */}
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
              style={{
                background: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accentColor} 55%, transparent)`,
                color: accentColor,
              }}
            >
              <IconComponent className="w-4 h-4" />
            </div>

            {/* Title */}
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white font-heading truncate tracking-tight">
              {category.name}
            </h2>
          </div>

          {/* Count Pill */}
          <div className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#0A1226] border border-[var(--line,#1A2442)] text-slate-600 dark:text-[var(--text-2,#A8B3C7)] shrink-0 select-none">
            {count} Sites
          </div>
        </div>

        {/* Sites List: Mobile 2-column split (<md) vs Desktop single-column (>=md) */}
        {sites.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-3,#6B7893)]">
            No sites listed in this category yet.
          </div>
        ) : (
          <>
            {/* Mobile View: 2 Columns */}
            <div className="grid grid-cols-2 gap-x-2 md:hidden">
              <div className="space-y-0.5">
                {leftColSites.map((site, index) => (
                  <SiteRow
                    key={site.id || index}
                    rank={site.rank ?? index + 1}
                    name={site.name}
                    displayName={site.displayName}
                    slug={site.slug}
                    faviconUrl={site.faviconUrl}
                    bestDomainUrl={site.bestDomainUrl}
                    domainsCount={site.domainsCount}
                    accentColor={accentColor}
                    onClick={() => onSelectSite?.(site)}
                    onExternalClick={(url) => onExternalClick?.(url, site)}
                  />
                ))}
              </div>
              <div className="space-y-0.5">
                {rightColSites.map((site, index) => (
                  <SiteRow
                    key={site.id || index + 8}
                    rank={site.rank ?? index + 9}
                    name={site.name}
                    displayName={site.displayName}
                    slug={site.slug}
                    faviconUrl={site.faviconUrl}
                    bestDomainUrl={site.bestDomainUrl}
                    domainsCount={site.domainsCount}
                    accentColor={accentColor}
                    onClick={() => onSelectSite?.(site)}
                    onExternalClick={(url) => onExternalClick?.(url, site)}
                  />
                ))}
              </div>
            </div>

            {/* Desktop View: Single Column (1-15) */}
            <div className="hidden md:block space-y-0.5">
              {sites.map((site, index) => (
                <SiteRow
                  key={site.id || index}
                  rank={site.rank ?? index + 1}
                  name={site.name}
                  displayName={site.displayName}
                  slug={site.slug}
                  faviconUrl={site.faviconUrl}
                  bestDomainUrl={site.bestDomainUrl}
                  domainsCount={site.domainsCount}
                  accentColor={accentColor}
                  onClick={() => onSelectSite?.(site)}
                  onExternalClick={(url) => onExternalClick?.(url, site)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer View More Button */}
      <ViewMoreButton
        href={`/category/${category.slug}`}
        accentColor={accentColor}
        label="View More"
      />
    </div>
  );
};
