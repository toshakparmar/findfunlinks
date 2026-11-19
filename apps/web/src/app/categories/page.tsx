import React from 'react';
import type { Metadata } from 'next';
import { CategoriesOverview } from '../../components/CategoriesOverview';
import { CLIENT_18_CATEGORIES } from '../../lib/client-catalog';

export const metadata: Metadata = {
  title: 'All Categories — FindFunLinks Web Directory',
  description:
    'Explore all 18 curated categories of fun websites with verified live working mirrors and domains.',
  openGraph: {
    title: 'All Categories — FindFunLinks Web Directory',
    description:
      'Explore all 18 curated categories of fun websites with verified live working mirrors and domains.',
    url: 'https://findfunlinks.com/categories',
    type: 'website',
  },
};

export default function CategoriesPage() {
  const totalSites = CLIENT_18_CATEGORIES.reduce((acc, c) => acc + (c.total ?? c.sites.length), 0);

  return (
    <CategoriesOverview
      categories={CLIENT_18_CATEGORIES}
      totalCategories={CLIENT_18_CATEGORIES.length}
      totalSites={totalSites}
    />
  );
}
