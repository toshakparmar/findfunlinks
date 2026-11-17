'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  api,
  type OwnerWebsiteDetails,
  type Category,
  type UpdateWebsiteInput,
} from '../../lib/api';
import { Save, RefreshCw, Eye, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OwnerWebsitePage() {
  const [website, setWebsite] = useState<OwnerWebsiteDetails | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UpdateWebsiteInput>({
    name: '',
    tagline: '',
    description: '',
    logoUrl: '',
    coverUrl: '',
    categoryId: '',
    language: 'en',
    contentRating: 'ALL',
    seoTitle: '',
    seoDescription: '',
    socialLinks: {
      twitter: '',
      discord: '',
      telegram: '',
      github: '',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [siteRes, catRes] = await Promise.all([
        api.owner.getWebsite(),
        api.public.getCategories().catch(() => []),
      ]);

      setWebsite(siteRes);
      setCategories(catRes);

      if (siteRes) {
        setFormData({
          name: siteRes.name || '',
          tagline: siteRes.tagline || '',
          description: siteRes.description || '',
          logoUrl: siteRes.logoUrl || '',
          coverUrl: siteRes.coverUrl || '',
          categoryId: siteRes.categoryId || '',
          language: siteRes.language || 'en',
          contentRating: siteRes.contentRating || 'ALL',
          seoTitle: siteRes.seoTitle || '',
          seoDescription: siteRes.seoDescription || '',
          socialLinks: (siteRes.socialLinks as Record<string, string>) || {},
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load website profile.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.owner.updateWebsite(formData);
      setWebsite(updated);
      toast.success('Website profile successfully updated!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update website profile.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const publicWebUrl = process.env.NEXT_PUBLIC_PUBLIC_WEB_URL || 'http://localhost:3000';

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-xs text-neutral-500">Loading website profile editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Website Profile & Metadata
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Edit your directory listing details, social handles, and search engine appearance.
          </p>
        </div>

        {website && (
          <a
            href={`${publicWebUrl}/website/${website.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            View Live Listing
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                General Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tagline (One-Sentence Summary)
                  </label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Primary Category
                  </label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Content Rating
                  </label>
                  <select
                    value={formData.contentRating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contentRating: e.target.value as 'ALL' | 'MATURE',
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Audiences (G/PG)</option>
                    <option value="MATURE">Mature Audiences (18+)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Description (Markdown Supported)
                  </label>
                  <textarea
                    rows={5}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what makes your website fun, interesting, or unique..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Assets & Visuals */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                Visual Assets
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Cover Banner URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                    value={formData.coverUrl || ''}
                    onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                Community & Social Links
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Discord Server URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://discord.gg/yourserver"
                    value={(formData.socialLinks as Record<string, string>)?.discord || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...(formData.socialLinks as Record<string, string>),
                          discord: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Twitter / X Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/yourhandle"
                    value={(formData.socialLinks as Record<string, string>)?.twitter || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...(formData.socialLinks as Record<string, string>),
                          twitter: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SEO Optimization */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                SEO & Meta Tags
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Custom SEO Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Play Retro Games Online | Working Mirrors"
                    value={formData.seoTitle || ''}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Meta Description
                  </label>
                  <input
                    type="text"
                    placeholder="Short description displayed in Google / search engine snippets"
                    value={formData.seoDescription || ''}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Preview */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm sticky top-24 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <Eye className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Directory Card Preview
                </h3>
              </div>

              {/* Live Preview Card */}
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-sm text-blue-600 overflow-hidden relative flex-shrink-0">
                    {formData.logoUrl ? (
                      <Image
                        src={formData.logoUrl}
                        alt="Logo Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      (formData.name || 'W').substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white block truncate">
                      {formData.name || 'Website Name'}
                    </span>
                    <span className="text-[11px] text-neutral-400 block truncate">
                      {formData.tagline || 'Short descriptive tagline'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {formData.description || 'Detailed directory description will be visible here.'}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-neutral-200/60 dark:border-neutral-700/60 text-[11px]">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Live Mirrors Online
                  </span>
                  <span className="text-neutral-400">
                    {formData.contentRating === 'MATURE' ? '18+' : 'Safe'}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Website Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
