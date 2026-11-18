import React from 'react';
import type { Metadata } from 'next';
import { api } from '../lib/api';
import { DirectoryView } from '../components/DirectoryView';
import { FALLBACK_CATEGORIES, FALLBACK_WEBSITES, CategoryMeta } from '../lib/directory-data';
import { WebsiteCardData } from '../components/DirectoryCard';
import { ContentRating, DomainStatus, DomainType } from '@findfunlinks/contracts';

export const revalidate = 60; // ISR revalidation every 60 seconds

export const metadata: Metadata = {
  title: 'FindFunLinks — Curated Web Directory & Working Mirrors',
  description:
    'Discover curated, entertaining websites and all their live working domains and mirrors so you never get stuck behind a broken link.',
  openGraph: {
    title: 'FindFunLinks — Curated Web Directory & Working Mirrors',
    description:
      'Curated web directory with live health-checked mirrors. Find alternatives and active links for the best fun websites.',
    url: 'https://findfunlinks.com',
    siteName: 'FindFunLinks',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindFunLinks — Curated Web Directory & Working Mirrors',
    description: 'Never get stuck behind a dead link. Find working mirrors for the fun web.',
  },
};

async function getDirectoryData(): Promise<{
  categories: CategoryMeta[];
  websites: WebsiteCardData[];
}> {
  try {
    const [categoriesRes, groupedRes] = await Promise.all([
      api.public.getCategories().catch(() => null),
      api.public.getWebsitesGrouped().catch(() => null),
    ]);

    let categories: CategoryMeta[] = FALLBACK_CATEGORIES;
    if (categoriesRes && Array.isArray(categoriesRes) && categoriesRes.length > 0) {
      categories = categoriesRes.map((c) => {
        const fallback = FALLBACK_CATEGORIES.find((f) => f.slug === c.slug);
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          count: c.websiteCount || 0,
          iconName: fallback?.iconName || 'Compass',
          themeColor: fallback?.themeColor || '#3b82f6',
          description: c.description || fallback?.description,
        };
      });
    }

    let websites: WebsiteCardData[] = FALLBACK_WEBSITES;
    if (groupedRes && Array.isArray(groupedRes) && groupedRes.length > 0) {
      const extracted: WebsiteCardData[] = [];
      for (const group of groupedRes) {
        if (group.websites && Array.isArray(group.websites)) {
          for (const w of group.websites) {
            extracted.push({
              id: w.id,
              name: w.name,
              slug: w.slug,
              tagline: w.tagline,
              description: w.description,
              logoUrl: w.logoUrl,
              categoryId: w.categoryId,
              categoryName: group.name,
              categorySlug: group.slug,
              tags: w.tags || [],
              contentRating: w.contentRating as ContentRating,
              isFeatured: w.isFeatured,
              viewCount: w.viewCount,
              activeDomainsCount: w.activeDomainsCount,
              primaryDomainUrl: w.primaryDomainUrl,
              domains: (w.domains || []).map((d) => ({
                id: d.id,
                hostname: d.hostname,
                url: d.url,
                label: d.label,
                type: d.type as DomainType,
                status: d.status as DomainStatus,
                lastCheckedAt: d.lastCheckedAt,
                lastResponseMs: d.lastResponseMs,
                clickCount: d.clickCount,
              })),
            });
          }
        }
      }
      if (extracted.length > 0) {
        websites = extracted;
      }
    }

    return { categories, websites };
  } catch {
    return {
      categories: FALLBACK_CATEGORIES,
      websites: FALLBACK_WEBSITES,
    };
  }
}

export default async function HomePage() {
  const { categories, websites } = await getDirectoryData();

  // JSON-LD structured data for WebSite and ItemList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://findfunlinks.com/#website',
        url: 'https://findfunlinks.com',
        name: 'FindFunLinks',
        description:
          'Curated directory of fun websites with real-time monitored live working mirrors.',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://findfunlinks.com/?search={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ItemList',
        name: 'Curated Fun Websites Directory',
        itemListElement: websites.slice(0, 10).map((site, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: site.name,
          url: `https://findfunlinks.com/website/${site.slug}`,
          description: site.description,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DirectoryView categories={categories} websites={websites} />
    </>
  );
}
