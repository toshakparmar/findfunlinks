import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { DirectoryCard, WebsiteCardData } from '../../../components/DirectoryCard';
import { FALLBACK_CATEGORIES, FALLBACK_WEBSITES } from '../../../lib/directory-data';
import { ContentRating } from '@findfunlinks/contracts';
import { ChevronRight, Folder, Globe, ArrowLeft } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
  const title = category ? `${category.name} Websites & Working Mirrors` : 'Category Directory';
  return {
    title,
    description: `Browse verified ${category?.name || slug} websites and their live working mirrors on FindFunLinks.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  let categoryName = 'Category';
  let categoryDescription = 'Explore curated links and working mirrors.';
  let categoryWebsites: WebsiteCardData[] = [];

  try {
    const data = await api.public.getCategoryBySlug(slug, 1, 50).catch(() => null);
    if (data) {
      categoryName = data.name;
      categoryDescription = data.description || categoryDescription;
      categoryWebsites = (data.websites || []).map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        tagline: w.tagline,
        description: w.description,
        logoUrl: w.logoUrl,
        categoryId: w.categoryId,
        categoryName: data.name,
        categorySlug: data.slug,
        tags: w.tags || [],
        contentRating: w.contentRating as ContentRating,
        isFeatured: w.isFeatured,
        viewCount: w.viewCount,
        activeDomainsCount: w.activeDomainsCount,
        primaryDomainUrl: w.primaryDomainUrl,
        domains: [],
      }));
    } else {
      // Fallback
      const fallbackCat = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
      if (fallbackCat) {
        categoryName = fallbackCat.name;
        categoryWebsites = FALLBACK_WEBSITES.filter((w) => w.categorySlug === slug);
      } else {
        // Find if any fallback website matches slug
        categoryWebsites = FALLBACK_WEBSITES.filter((w) => w.categorySlug === slug);
        if (categoryWebsites.length > 0 && categoryWebsites[0]) {
          categoryName = categoryWebsites[0].categoryName || slug;
        }
      }
    }
  } catch {
    categoryWebsites = FALLBACK_WEBSITES.filter((w) => w.categorySlug === slug);
  }

  // If completely unknown and no websites, still show friendly view or notFound
  const totalMirrors = categoryWebsites.reduce(
    (acc, w) => acc + (w.domains?.length || w.activeDomainsCount || 1),
    0,
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-muted-foreground mb-6"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/" className="hover:text-foreground transition-colors">
          Categories
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-semibold truncate">{categoryName}</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-brand-blue-50/30 to-card dark:via-brand-blue-950/20 p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Folder className="h-3.5 w-3.5" />
              <span>Category Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{categoryName}</h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {categoryDescription}
            </p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground text-sm">
              {categoryWebsites.length} Active Websites
            </span>
            <span>{totalMirrors} Verified Working Mirrors</span>
          </div>
        </div>
      </div>

      {/* Category Websites Grid */}
      {categoryWebsites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoryWebsites.map((website) => (
            <DirectoryCard key={website.id} website={website} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border/80 bg-card">
          <Globe className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-1">
            No websites listed in {categoryName} yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Know an awesome website that belongs in this category? Submit it to our directory for
            verification.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Submit Website
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
