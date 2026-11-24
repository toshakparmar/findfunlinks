import React from 'react';
import type { Metadata } from 'next';
import { CategoriesOverview } from '../../components/CategoriesOverview';
import { CATEGORIES_29_CATALOG } from '../../lib/categories-data';

export const metadata: Metadata = {
  title: 'All Categories — FinalLinks Web Directory',
  description:
    'Browse all 29 categories and find your favorite links with verified live working mirrors and domains.',
  openGraph: {
    title: 'All Categories — FinalLinks Web Directory',
    description:
      'Browse all 29 categories and find your favorite links with verified live working mirrors and domains.',
    url: 'https://finallinks.com/categories',
    type: 'website',
  },
};

export default function CategoriesPage() {
  return <CategoriesOverview categories={CATEGORIES_29_CATALOG} />;
}
