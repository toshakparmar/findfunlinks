'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CategoryTileStrip } from './CategoryTileStrip';
import { CategoryCard, CategoryCardSiteItem } from './CategoryCard';
import { useSearch } from '../lib/search-context';
import { CLIENT_18_CATEGORIES } from '../lib/client-catalog';

export interface DirectoryViewProps {
  categories?: any[];
  websites?: any[];
}

export function DirectoryView(props?: DirectoryViewProps) {
  const router = useRouter();
  const { searchQuery } = useSearch();

  // Dynamic categories from DB via props, fallback to client catalog
  const visibleCategories = React.useMemo(() => {
    if (
      props?.categories &&
      props.categories.length > 0 &&
      props?.websites &&
      props.websites.length > 0
    ) {
      const mapped = props.categories.map((cat, catIdx) => {
        if (!cat) return CLIENT_18_CATEGORIES[catIdx % CLIENT_18_CATEGORIES.length]!;
        const catWebsites = props.websites!.filter(
          (w) =>
            w &&
            (w.categoryId === cat.id || w.categorySlug === cat.slug) &&
            (w.primaryDomainUrl || (w.domains && w.domains.length > 0)),
        );
        if (catWebsites.length > 0) {
          const fallbackCat = CLIENT_18_CATEGORIES.find((c) => c.slug === cat.slug);
          return {
            id: cat.id || fallbackCat?.id || `cat-${catIdx}`,
            slug: cat.slug || fallbackCat?.slug || `cat-${catIdx}`,
            name: cat.name || fallbackCat?.name || 'Category',
            iconName: cat.iconName || fallbackCat?.iconName || 'PlaySquare',
            accentKey: fallbackCat?.accentKey || 'accent-purple',
            themeColor: cat.themeColor || fallbackCat?.themeColor || '#8B5CF6',
            total: cat.count || catWebsites.length,
            homeLimit: cat.homeLimit || fallbackCat?.homeLimit || 10,
            sites: catWebsites.map((w, idx) => ({
              id: w.id,
              rank: idx + 1,
              name: w.name,
              displayName: w.name,
              slug: w.slug,
              faviconUrl:
                w.logoUrl ||
                `https://www.google.com/s2/favicons?domain=${w.primaryDomainUrl || `${w.slug}.com`}&sz=64`,
              bestDomainUrl: w.primaryDomainUrl || w.domains?.[0]?.url || `https://${w.slug}.com`,
              domainsCount: w.domains?.length || w.activeDomainsCount || 1,
              domains: (w.domains || []).map((d: any) => ({
                id: d.id,
                domainName: d.hostname || d.url?.replace(/^https?:\/\//, '') || d.label,
                url: d.url,
                domainType: d.type || 'PRIMARY',
                status: d.status || 'ACTIVE',
                lastResponseMs: d.lastResponseMs || 80,
              })),
            })),
          };
        }
        const fallbackCat = CLIENT_18_CATEGORIES.find((c) => c.slug === cat.slug);
        const resolved = fallbackCat || CLIENT_18_CATEGORIES[catIdx % CLIENT_18_CATEGORIES.length]!;
        return {
          ...resolved,
          homeLimit: cat.homeLimit ?? resolved.homeLimit ?? 10,
        };
      });
      return mapped.filter((c): c is (typeof CLIENT_18_CATEGORIES)[number] =>
        Boolean(c && c.sites),
      );
    }
    return CLIENT_18_CATEGORIES;
  }, [props?.categories, props?.websites]);

  // Filter sites within category if search query active
  const q = searchQuery?.toLowerCase().trim() || '';

  const handleSelectSite = (site: CategoryCardSiteItem) => {
    router.push(`/website/${encodeURIComponent(site.slug)}`);
  };

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* 1. Category Quick-Access Tile Strip (Section 4) */}
      <CategoryTileStrip />

      {/* 2. Responsive Category Cards Grid (Section 6) */}
      <div
        className="grid gap-4 md:gap-5"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
        }}
      >
        {visibleCategories.map((cat) => {
          const matchingSites = q
            ? cat.sites.filter(
                (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q),
              )
            : cat.sites;

          // If searching and this category has no matches, skip
          if (q && matchingSites.length === 0) return null;

          return (
            <div key={cat.slug} id={`category-${cat.slug}`}>
              <CategoryCard
                category={{
                  id: cat.id,
                  slug: cat.slug,
                  name: cat.name,
                  iconName: cat.iconName,
                  accentKey: cat.accentKey,
                  themeColor: cat.themeColor,
                  total: cat.total,
                  homeLimit: cat.homeLimit ?? 10,
                }}
                sites={matchingSites}
                onSelectSite={handleSelectSite}
                onExternalClick={(url) => {
                  window.open(url, '_blank');
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
