import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '../../../lib/api';
import { WebsiteDetailView } from '../../../components/WebsiteDetailView';
import { FALLBACK_WEBSITES } from '../../../lib/directory-data';
import { ContentRating, DomainStatus, DomainType } from '@findfunlinks/contracts';

interface WebsitePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: WebsitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const fallback = FALLBACK_WEBSITES.find((w) => w.slug === slug);
  const title = fallback ? `${fallback.name} — Verified Working Mirrors` : 'Website Details';
  const description = fallback?.tagline || 'Working domains and live mirrors on FindFunLinks.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function WebsiteDetailPage({ params }: WebsitePageProps) {
  const { slug } = await params;

  let websiteData = null;

  try {
    const data = await api.public.getWebsiteBySlug(slug).catch(() => null);
    if (data) {
      websiteData = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        tagline: data.tagline,
        description: data.description,
        logoUrl: data.logoUrl,
        coverUrl: data.coverUrl,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        categorySlug: data.categorySlug,
        tags: data.tags || [],
        language: data.language,
        contentRating: data.contentRating as ContentRating,
        isFeatured: data.isFeatured,
        viewCount: data.viewCount,
        socialLinks: (data as unknown as { socialLinks?: Record<string, string> }).socialLinks,
        domains: (data.domains || []).map((d) => ({
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
      };
    }
  } catch {
    websiteData = null;
  }

  // Fallback to sample data if database not responding or demo item
  if (!websiteData) {
    const fallback = FALLBACK_WEBSITES.find((w) => w.slug === slug);
    if (fallback) {
      websiteData = {
        ...fallback,
        domains: fallback.domains || [],
      };
    }
  }

  if (!websiteData) {
    notFound();
  }

  // Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: websiteData.name,
    url: `https://findfunlinks.com/website/${websiteData.slug}`,
    description: websiteData.description,
    alternateName: websiteData.domains.map((d) => d.hostname),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WebsiteDetailView website={websiteData} />
    </>
  );
}
