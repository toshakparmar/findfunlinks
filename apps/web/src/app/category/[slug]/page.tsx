import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CLIENT_18_CATEGORIES } from '../../../lib/client-catalog';
import { EXTENDED_CATALOG_CATEGORIES } from '../../../lib/extended-catalog';
import { CategoryDetailView } from '../../../components/CategoryDetailView';
import { api } from '../../../lib/api';

const ALL_CATALOG_CATEGORIES = [...CLIENT_18_CATEGORIES, ...EXTENDED_CATALOG_CATEGORIES];

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  let categoryName = '';
  let categorySlug = slug;

  try {
    const data: any = await api.public.getCategoryBySlug(slug).catch(() => null);
    const cat = data?.category || data;
    if (cat && (cat.name || cat.slug)) {
      categoryName = cat.name;
      categorySlug = cat.slug;
    }
  } catch {}

  if (!categoryName) {
    const staticCat = ALL_CATALOG_CATEGORIES.find((c) => c.slug === slug);
    if (staticCat) {
      categoryName = staticCat.name;
      categorySlug = staticCat.slug;
    }
  }

  if (!categoryName) {
    return {
      title: 'Category Not Found — FinalLinks',
    };
  }

  const title = `${categoryName} Websites & Working Mirrors — FinalLinks`;
  const description = `Browse verified, official ${categoryName} websites and all their live working mirrors and domains so you never get stuck behind a broken link.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://finallinks.com/category/${categorySlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  let category: any = null;
  let sites: any[] = [];

  try {
    const data: any = await api.public.getCategoryBySlug(slug, 1, 1000).catch(() => null);
    const cat = data?.category || data;
    if (cat && (cat.name || cat.slug)) {
      category = {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        iconName: cat.icon || 'Folder',
        description: cat.description,
        total: data.pagination?.total ?? (data.websites || []).length,
      };
      const dbSites = (data.websites || []).map((w: any, idx: number) => ({
        id: w.id,
        rank: idx + 1,
        name: w.name,
        displayName: w.name,
        slug: w.slug,
        faviconUrl: w.logoUrl,
        bestDomainUrl: w.domains?.[0]?.hostname ? `https://${w.domains[0].hostname}` : undefined,
        domainsCount: w.domains?.length || 0,
        domains: w.domains || [],
        createdAt: w.createdAt,
        isFeatured: w.isFeatured,
      }));

      // Merge with static catalog if available so that all websites in DB and catalog are visible
      const staticCat = ALL_CATALOG_CATEGORIES.find((c) => c.slug === slug);
      if (staticCat && staticCat.sites) {
        const existingSlugs = new Set(dbSites.map((s: any) => s.slug.toLowerCase()));
        const additionalSites = staticCat.sites
          .filter((s: any) => !existingSlugs.has(s.slug.toLowerCase()))
          .map((s: any, idx: number) => ({
            ...s,
            rank: dbSites.length + idx + 1,
          }));
        sites = [...dbSites, ...additionalSites];
        category.total = sites.length;
      } else {
        sites = dbSites;
      }
    }
  } catch {}

  if (!category) {
    const staticCat = ALL_CATALOG_CATEGORIES.find((c) => c.slug === slug);
    if (staticCat) {
      category = {
        id: staticCat.id,
        slug: staticCat.slug,
        name: staticCat.name,
        iconName: staticCat.iconName,
        accentKey: staticCat.accentKey,
        themeColor: staticCat.themeColor,
        total: staticCat.total ?? staticCat.sites.length,
      };
      sites = staticCat.sites;
    }
  }

  if (!category) {
    notFound();
  }

  // Schema.org structured data for Category and ItemList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://finallinks.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Categories',
            item: 'https://finallinks.com/categories',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: category.name,
            item: `https://finallinks.com/category/${category.slug}`,
          },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${category.name} Websites`,
        description: `Verified ${category.name} websites and active mirrors`,
        itemListElement: sites.map((site: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: site.name,
          url: `https://finallinks.com/site/${site.slug}`,
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
      <React.Suspense
        fallback={
          <div className="w-full py-20 text-center text-fs-base text-[var(--text-3,#6B7893)]">
            Loading category...
          </div>
        }
      >
        <CategoryDetailView
          category={{
            id: category.id,
            slug: category.slug,
            name: category.name,
            iconName: category.iconName,
            accentKey: category.accentKey,
            themeColor: category.themeColor,
            total: category.total ?? sites.length,
          }}
          sites={sites}
        />
      </React.Suspense>
    </>
  );
}
