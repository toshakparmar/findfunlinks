'use client';

import React, { useState } from 'react';
import { CategoryChips } from './CategoryChips';
import { CategoryCard, CategoryCardSiteItem } from './CategoryCard';
import { SiteDomainsDrawer, SiteDetailModalData } from './SiteDomainsDrawer';
import { useSearch } from '../lib/search-context';
import { CLIENT_18_CATEGORIES } from '../lib/client-catalog';

export interface DirectoryViewProps {
  categories?: any[];
  websites?: any[];
}

export function DirectoryView(_props?: DirectoryViewProps) {
  const { searchQuery } = useSearch();
  const [selectedDrawerSite, setSelectedDrawerSite] = useState<SiteDetailModalData | null>(null);

  // Home always renders all 18 categories in order
  const visibleCategories = CLIENT_18_CATEGORIES;

  // Filter sites within category if search query active
  const q = searchQuery?.toLowerCase().trim() || '';

  const handleSelectSite = (site: CategoryCardSiteItem, categoryName: string, accentColor?: string) => {
    // Find complete site from catalog to populate drawer
    for (const cat of CLIENT_18_CATEGORIES) {
      const found = cat.sites.find((s) => s.id === site.id || s.slug === site.slug);
      if (found) {
        setSelectedDrawerSite({
          id: found.id,
          name: found.name,
          displayName: found.displayName,
          slug: found.slug,
          faviconUrl: found.faviconUrl,
          categoryName,
          accentColor: accentColor || '#3B82F6',
          domains: found.domains || [],
        });
        return;
      }
    }

    // Fallback if not found in catalog
    setSelectedDrawerSite({
      id: site.id,
      name: site.name,
      displayName: site.displayName,
      slug: site.slug,
      faviconUrl: site.faviconUrl,
      categoryName,
      accentColor: accentColor || '#3B82F6',
      domains: [
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
    <div className="w-full space-y-4 md:space-y-6">
      {/* 1. Mobile Horizontal Scroll Snap Category Chips */}
      <CategoryChips />

      {/* 2. Responsive 2-Column Category Cards Grid (18 Cards) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-5">
        {visibleCategories.map((cat) => {
          const matchingSites = q
            ? cat.sites.filter(
                (s) =>
                  s.name.toLowerCase().includes(q) ||
                  s.slug.toLowerCase().includes(q)
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
                }}
                sites={matchingSites}
                onSelectSite={(site) =>
                  handleSelectSite(site, cat.name, cat.themeColor || undefined)
                }
                onExternalClick={(url) => {
                  window.open(url, '_blank', 'noopener,noreferrer,nofollow');
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 3. Site Working Mirrors Drawer Modal */}
      <SiteDomainsDrawer
        isOpen={!!selectedDrawerSite}
        onClose={() => setSelectedDrawerSite(null)}
        site={selectedDrawerSite}
      />
    </div>
  );
}
