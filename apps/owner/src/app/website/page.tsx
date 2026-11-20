'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  api,
  type OwnerWebsiteDetails,
  type Category,
  type UpdateWebsiteInput,
} from '../../lib/api';
import { Save, RefreshCw, Eye, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
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
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#3B82F6]" />
        <p className="text-xs text-[#A8B3C7]">Loading website profile editor...</p>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="bg-[#0A1226] rounded-3xl border border-[#1A2442] p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center mx-auto text-[#F59E0B]">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-[#F1F5F9]">No Registered Website Assigned</h2>
          <p className="text-xs text-[#A8B3C7] max-w-md mx-auto leading-relaxed">
            Your account is currently not linked to a directory entry. Once your registration is
            approved by Super Admin, you can edit your profile here.
          </p>
        </div>
      </div>
    );
  }

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">
            Website Directory Profile
          </h1>
          <p className="text-xs text-[#A8B3C7] mt-1">
            Customize how your website appears to visitors across search queries, discovery rails,
            and cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {website?.slug && (
            <a
              href={`${publicWebUrl}/website/${website.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#070D1E] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#3B82F6]" />
              View Public Card
            </a>
          )}
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Form Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity & Basic Info */}
            <div className="bg-[#0A1226] rounded-2xl border border-[#1A2442] p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-[#F1F5F9] border-b border-[#1A2442] pb-3">
                Listing Identity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                    Website Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                    Primary Category
                  </label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                    One-Line Catchy Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Free streaming anime with zero intrusive popups"
                    value={formData.tagline || ''}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                    Content Rating
                  </label>
                  <select
                    value={formData.contentRating || 'ALL'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contentRating: e.target.value as 'ALL' | 'MATURE',
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  >
                    <option value="ALL">All Audiences (General)</option>
                    <option value="MATURE">Mature (18+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                    Language
                  </label>
                  <select
                    value={formData.language || 'en'}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  >
                    <option value="en">English (Global)</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                    <option value="es">Spanish</option>
                    <option value="multi">Multi-Language</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                    Full Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what makes your website fun, interesting, or unique..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>
            </div>

            {/* Assets & Visuals */}
            <div className="bg-[#0A1226] rounded-2xl border border-[#1A2442] p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-[#F1F5F9] border-b border-[#1A2442] pb-3">
                Visual Assets & Branding
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                    Cover Banner URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                    value={formData.coverUrl || ''}
                    onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>
            </div>

            {/* Community & Social Links */}
            <div className="bg-[#0A1226] rounded-2xl border border-[#1A2442] p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-[#F1F5F9] border-b border-[#1A2442] pb-3">
                Community & Social Links
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md shadow-[#2563EB]/25 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="space-y-4">
            <div className="bg-[#0A1226] rounded-2xl border border-[#1A2442] p-5 shadow-sm sticky top-24 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1A2442] pb-3">
                <Eye className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="font-bold text-xs text-[#F1F5F9] uppercase tracking-wider">
                  Live Directory Card Preview
                </h3>
              </div>

              {/* Preview Card styled as Main Web Directory Card */}
              <div className="p-4 rounded-2xl border border-[#1A2442] bg-[#070D1E] space-y-3 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center font-bold text-base text-[#3B82F6] overflow-hidden relative shrink-0">
                    {formData.logoUrl ? (
                      <Image src={formData.logoUrl} alt="Preview" fill className="object-cover" />
                    ) : (
                      (formData.name || 'Site').substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-[#F1F5F9] truncate">
                      {formData.name || 'Your Website Name'}
                    </h4>
                    <p className="text-[11px] text-[#A8B3C7] truncate mt-0.5">
                      {formData.tagline || 'Your catchy tagline will show up here'}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-[#A8B3C7] line-clamp-2 leading-relaxed bg-[#050A18] p-2.5 rounded-lg border border-[#1A2442]">
                  {formData.description ||
                    'Detailed description of your service, features, and content offerings.'}
                </p>

                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#1A2442] text-[#F1F5F9] font-semibold">
                    {selectedCategory?.name || 'Category'}
                  </span>
                  <span className="text-[#22C55E] font-semibold flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
