import { MetadataRoute } from 'next';
import { FALLBACK_CATEGORIES, FALLBACK_WEBSITES } from '../lib/directory-data';
import { api } from '../lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://findfunlinks.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dmca`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Categories
  let categories: Array<{ slug: string }> = FALLBACK_CATEGORIES;
  try {
    const res = await api.public.getCategories().catch(() => null);
    if (res && Array.isArray(res) && res.length > 0) {
      categories = res;
    }
  } catch {}

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Websites
  let websites = FALLBACK_WEBSITES;
  try {
    const res = await api.public.getWebsites({ limit: 100 }).catch(() => null);
    if (res && res.items && Array.isArray(res.items) && res.items.length > 0) {
      websites = res.items;
    }
  } catch {}

  const websiteRoutes: MetadataRoute.Sitemap = websites.map((w) => ({
    url: `${baseUrl}/website/${w.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...websiteRoutes];
}
