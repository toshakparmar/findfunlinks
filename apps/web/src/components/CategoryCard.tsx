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
  onSelectSite: _onSelectSite,
  onExternalClick,
  className = '',
}) => {
  const [expandedSlug, setExpandedSlug] = React.useState<string | null>(null);

  const handleToggleRow = (slug: string) => {
    setExpandedSlug((prev) => (prev === slug ? null : slug));
  };
  const accentColor = category.themeColor || 'var(--accent-purple, #8B5CF6)';
  const IconComponent = getIconComponent(category.iconName);
  const totalCount = category.total ?? sites.length;
  const limit = category.homeLimit ?? 10;
  const displayedSites = sites.slice(0, limit);

  return (
    <div
      className={`cat-card flex flex-col justify-between p-3 sm:p-4 rounded-[14px] sm:rounded-[16px] bg-[var(--card,#0A1226)] transition-all duration-200 relative overflow-hidden ${className}`}
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
          className="flex items-center justify-between pb-1.5 sm:pb-2 mb-1.5 sm:mb-2 border-b border-[var(--line,#1A2442)]"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 14%, transparent), transparent)`,
            margin: '-12px -12px 8px -12px',
            padding: '10px 12px 8px 12px',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Icon Chip */}
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] sm:rounded-[10px] flex items-center justify-center shrink-0"
              style={{
                background: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accentColor} 55%, transparent)`,
                color: accentColor,
              }}
            >
              <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            {/* Title */}
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white font-heading truncate tracking-tight">
              {category.name}
            </h2>
          </div>

          {/* Count Pill: Total websites in category */}
          <div className="px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-fs-sm font-semibold bg-slate-100 dark:bg-[#16203D] border border-slate-200 dark:border-[#1E2C52] text-slate-700 dark:text-[#93C5FD] shrink-0 select-none tabular-nums shadow-xs">
            {totalCount} {totalCount === 1 ? 'Site' : 'Sites'}
          </div>
        </div>

        {/* Sites List: Single-column on mobile & desktop (Section 6) */}
        {displayedSites.length === 0 ? (
          <div className="py-8 text-center text-fs-xs text-[var(--text-3,#6B7893)]">
            No sites listed in this category yet.
          </div>
        ) : (
          <div className="space-y-0.5">
            {displayedSites.map((site, index) => (
              <SiteRow
                key={site.id || site.slug || index}
                rank={site.rank ?? index + 1}
                name={site.name}
                displayName={site.displayName}
                slug={site.slug}
                faviconUrl={site.faviconUrl}
                bestDomainUrl={site.bestDomainUrl}
                domainsCount={site.domainsCount}
                accentColor={accentColor}
                categoryName={category.name}
                categorySlug={category.slug}
                expanded={expandedSlug === site.slug}
                onToggle={() => handleToggleRow(site.slug)}
                onExternalClick={(url) => onExternalClick?.(url, site)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer View All Button - only shown when total > limit (Section 6) */}
      {totalCount > limit && (
        <ViewMoreButton
          href={`/category/${category.slug}`}
          accentColor={accentColor}
          label="View All"
        />
      )}
    </div>
  );
};
