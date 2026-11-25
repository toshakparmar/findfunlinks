import React from 'react';
import type { Metadata } from 'next';
import { CategoriesOverview } from '../../components/CategoriesOverview';
import {
  CATEGORIES_29_CATALOG,
  CATEGORY_SLUG_ALIASES,
  getCategoryMetadata,
  type DirectoryCategoryItem,
} from '../../lib/categories-data';
import { api } from '../../lib/api';

export const metadata: Metadata = {
  title: 'All Categories — FinalLinks Web Directory',
  description:
    'Browse all categories and find your favorite links with verified live working mirrors and domains.',
  openGraph: {
    title: 'All Categories — FinalLinks Web Directory',
    description:
      'Browse all categories and find your favorite links with verified live working mirrors and domains.',
    url: 'https://finallinks.com/categories',
    type: 'website',
  },
};

export default async function CategoriesPage() {
  // Start with the full 29 catalog categories preserved in the exact visual order from Image 2 & 3
  const categoriesMap = new Map<string, DirectoryCategoryItem>();

  CATEGORIES_29_CATALOG.forEach((cat) => {
    categoriesMap.set(cat.slug.toLowerCase(), { ...cat });
  });

  try {
    const res = await api.public.getCategories().catch(() => null);
    if (res && Array.isArray(res) && res.length > 0) {
      for (const dbCat of res) {
        if (!dbCat.name || dbCat.name.toLowerCase() === 'test') continue;
        const normalizedSlug = (
          CATEGORY_SLUG_ALIASES[dbCat.slug.toLowerCase()] || dbCat.slug
        ).toLowerCase();

        if (categoriesMap.has(normalizedSlug)) {
          const existing = categoriesMap.get(normalizedSlug)!;
          existing.id = dbCat.id;
          if (typeof dbCat.websiteCount === 'number') {
            existing.total = dbCat.websiteCount;
          }
        } else {
          // Extra database categories (Software, Tools, Ebooks, Comics, etc.)
          const meta = getCategoryMetadata(dbCat.slug, dbCat.name);
          categoriesMap.set(dbCat.slug.toLowerCase(), {
            id: dbCat.id,
            name: dbCat.name,
            slug: dbCat.slug,
            iconName: dbCat.icon || meta.iconName,
            accentKey: meta.accentKey,
            themeColor: meta.themeColor,
            total: dbCat.websiteCount ?? 0,
            homeOrder: 100 + categoriesMap.size,
          });
        }
      }
    }
  } catch {}

  const categories = Array.from(categoriesMap.values());

  return <CategoriesOverview categories={categories} />;
}
