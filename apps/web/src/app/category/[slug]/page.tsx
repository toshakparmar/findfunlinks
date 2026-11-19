import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CLIENT_18_CATEGORIES } from '../../../lib/client-catalog';
import { CategoryDetailView } from '../../../components/CategoryDetailView';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CLIENT_18_CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: 'Category Not Found — FindFunLinks',
    };
  }

  const title = `${category.name} Websites & Working Mirrors — FindFunLinks`;
  const description = `Browse verified, official ${category.name} websites and all their live working mirrors and domains so you never get stuck behind a broken link.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://findfunlinks.com/category/${category.slug}`,
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
  const category = CLIENT_18_CATEGORIES.find((c) => c.slug === slug);

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
            item: 'https://findfunlinks.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Categories',
            item: 'https://findfunlinks.com/categories',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: category.name,
            item: `https://findfunlinks.com/category/${category.slug}`,
          },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${category.name} Websites`,
        description: `Verified ${category.name} websites and active mirrors`,
        itemListElement: category.sites.map((site, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: site.name,
          url: `https://findfunlinks.com/site/${site.slug}`,
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
      <CategoryDetailView
        category={{
          id: category.id,
          slug: category.slug,
          name: category.name,
          iconName: category.iconName,
          accentKey: category.accentKey,
          themeColor: category.themeColor,
          total: category.total ?? category.sites.length,
        }}
        sites={category.sites}
      />
    </>
  );
}
