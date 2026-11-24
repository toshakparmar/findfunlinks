import React from 'react';
import type { Metadata } from 'next';
import { api } from '../lib/api';
import { DirectoryView } from '../components/DirectoryView';
import { CategoryMeta } from '../lib/directory-data';
import { CLIENT_18_CATEGORIES } from '../lib/client-catalog';
import { WebsiteCardData } from '../components/DirectoryCard';
import { ContentRating, DomainStatus, DomainType } from '@finallinks/contracts';

export const revalidate = 60; // ISR revalidation every 60 seconds

const CATALOG_FALLBACK_CATEGORIES: CategoryMeta[] = CLIENT_18_CATEGORIES.map((c) => ({
  id: c.id || c.slug,
  name: c.name,
  slug: c.slug,
  count: c.total || c.sites.length,
  iconName: c.iconName || 'PlaySquare',
  themeColor: c.themeColor || '#8B5CF6',
  description: `Official verified ${c.name} directory and active working mirrors.`,
}));

const CATALOG_FALLBACK_WEBSITES: WebsiteCardData[] = CLIENT_18_CATEGORIES.flatMap((c) =>
  c.sites.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    tagline: s.tagline || `Official verified directory listing for ${s.name}.`,
    description: s.description || s.tagline || `Official verified directory listing for ${s.name}.`,
    logoUrl:
      s.faviconUrl ||
      `https://www.google.com/s2/favicons?domain=${s.bestDomainUrl || `${s.slug}.com`}&sz=64`,
    categoryId: c.id || c.slug,
    categoryName: c.name,
    categorySlug: c.slug,
    tags: [],
    contentRating: 'ALL' as ContentRating,
    isFeatured: true,
    viewCount: 1200,
    activeDomainsCount: s.domains?.length || 1,
    primaryDomainUrl: s.bestDomainUrl,
    domains: (s.domains || []).map((d: any) => ({
      id: d.id,
      hostname: d.domainName || d.url?.replace(/^https?:\/\//, '') || s.name,
      url: d.url,
      label: d.domainName || s.name,
      type: (d.domainType || 'PRIMARY') as DomainType,
      status: (d.status || 'ACTIVE') as DomainStatus,
      lastCheckedAt: new Date().toISOString(),
      lastResponseMs: d.lastResponseMs || 50,
      clickCount: 150,
    })),
  })),
);

export const metadata: Metadata = {
  title: 'FinalLinks — Curated Web Directory & Working Mirrors',
  description:
    'Discover curated, entertaining websites and all their live working domains and mirrors so you never get stuck behind a broken link.',
  openGraph: {
    title: 'FinalLinks — Curated Web Directory & Working Mirrors',
    description:
      'Curated web directory with live health-checked mirrors. Find alternatives and active links for the best fun websites.',
    url: 'https://finallinks.com',
    siteName: 'FinalLinks',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinalLinks — Curated Web Directory & Working Mirrors',
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

    let categories: CategoryMeta[] = CATALOG_FALLBACK_CATEGORIES;
    if (categoriesRes && Array.isArray(categoriesRes) && categoriesRes.length > 0) {
      categories = categoriesRes.map((c) => {
        const fallback = CATALOG_FALLBACK_CATEGORIES.find((f) => f.slug === c.slug);
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          count: c.websiteCount || 0,
          iconName: c.icon || fallback?.iconName || 'Compass',
          themeColor: fallback?.themeColor || '#3b82f6',
          description: c.description || fallback?.description,
        };
      });
    }

    let websites: WebsiteCardData[] = CATALOG_FALLBACK_WEBSITES;
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
              categoryId: (group as any).category?.id || w.categoryId,
              categoryName: (group as any).category?.name || group.name,
              categorySlug: (group as any).category?.slug || group.slug,
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
      categories: CATALOG_FALLBACK_CATEGORIES,
      websites: CATALOG_FALLBACK_WEBSITES,
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
        '@id': 'https://finallinks.com/#website',
        url: 'https://finallinks.com',
        name: 'FinalLinks',
        description:
          'Curated directory of fun websites with real-time monitored live working mirrors.',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://finallinks.com/?search={search_term_string}',
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
          url: `https://finallinks.com/website/${site.slug}`,
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
