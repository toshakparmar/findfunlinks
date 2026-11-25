import React from 'react';
import type { Metadata } from 'next';
import { CategoriesOverview } from '../../components/CategoriesOverview';
import { CATEGORIES_29_CATALOG, type DirectoryCategoryItem } from '../../lib/categories-data';
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
  let categories: DirectoryCategoryItem[] = CATEGORIES_29_CATALOG;

  try {
    const res = await api.public.getCategories().catch(() => null);
    if (res && Array.isArray(res) && res.length > 0) {
      // Merge live database categories with our catalog metadata (vibrant theme colors & icons)
      categories = res.map((c, idx) => {
        const catalogMatch = CATEGORIES_29_CATALOG.find(
          (cat) => cat.slug.toLowerCase() === c.slug.toLowerCase(),
        );
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          iconName: c.icon || catalogMatch?.iconName || 'Folder',
          accentKey: catalogMatch?.accentKey || 'accent-blue',
          themeColor: catalogMatch?.themeColor || '#2563EB',
          total: c.websiteCount ?? 0,
          homeOrder: idx + 1,
        };
      });
    }
  } catch {}

  return <CategoriesOverview categories={categories} />;
}
