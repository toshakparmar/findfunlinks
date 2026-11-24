'use client';

import React, { useEffect, useState } from 'react';
import {
  api,
  type OwnerWebsiteDetails,
  type Category,
  type UpdateWebsiteInput,
} from '../../../lib/api';
import { Save, RefreshCw, Eye, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@finallinks/ui';

export default function MyWebsiteEditPage() {
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
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0B9DF7]" />
        <p className="text-sm text-[#9CA3AF]">Loading website profile editor...</p>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="bg-[#1E2024] rounded-xl border border-[#33373D] p-8 text-center space-y-4 max-w-xl mx-auto mt-12">
        <div className="w-12 h-12 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center mx-auto text-[#F59E0B]">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-[#F3F4F6]">No Registered Website Assigned</h2>
          <p className="text-sm text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
            Your account is currently not linked to a directory entry. Once your registration is
            approved by an administrator, you can edit your profile here.
          </p>
        </div>
      </div>
    );
  }

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">
            Website Directory Profile
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Customize how your website appears to visitors across search queries, discovery rails,
            and cards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {website?.slug && (
            <a
              href={`${publicWebUrl}/website/${website.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#F3F4F6] hover:bg-[#26292F] transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-[#0B9DF7]" />
              View Public Card
            </a>
          )}
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#F3F4F6] hover:bg-[#26292F] transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-[#0B9DF7]" />
            Reset
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Core Identity & Visual Branding */}
          <div className="space-y-6">
            {/* Identity & Basic Info */}
            <div className="bg-[#1E2024] rounded-xl border border-[#33373D] p-6 shadow-sm space-y-5">
              <h2 className="text-base font-semibold text-[#F3F4F6] border-b border-[#33373D] pb-3">
                Listing Identity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                    Website Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] focus:ring-1 focus:ring-[#0B9DF7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                    Primary Category
                  </label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
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
                  <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                    Catchy Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Free streaming anime with zero intrusive popups"
                    value={formData.tagline || ''}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] focus:ring-1 focus:ring-[#0B9DF7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
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
                    className="w-full h-11 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                  >
                    <option value="ALL">All Audiences (General)</option>
                    <option value="MATURE">Mature (18+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                    Language
                  </label>
                  <select
                    value={formData.language || 'en'}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                  >
                    <option value="en">English (Global)</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                    <option value="es">Spanish</option>
                    <option value="multi">Multi-Language</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                    Full Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what makes your website fun, interesting, or unique..."
                    className="w-full p-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
                  />
                </div>
              </div>
            </div>

            {/* Assets & Visuals */}
            <div className="bg-[#1E2024] rounded-xl border border-[#33373D] p-6 shadow-sm space-y-5">
              <h2 className="text-base font-semibold text-[#F3F4F6] border-b border-[#33373D] pb-3">
                Visual Assets & Branding
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-mono text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                    Cover Banner URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                    value={formData.coverUrl || ''}
                    onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-mono text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Directory Card Preview & Community Links */}
          <div className="space-y-6">
            {/* Live Directory Card Preview */}
            <div className="bg-[#1E2024] rounded-xl border border-[#33373D] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#33373D] pb-3">
                <Eye className="w-4 h-4 text-[#0B9DF7]" />
                <h3 className="font-semibold text-xs text-[#9CA3AF] uppercase tracking-wider">
                  Live Directory Card Preview
                </h3>
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-xl border border-[#33373D] bg-[#16181B] space-y-3 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#0B9DF7]/15 border border-[#0B9DF7]/30 flex items-center justify-center font-bold text-base text-[#0B9DF7] overflow-hidden relative shrink-0">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Logo variant="mark" size={24} className="w-6 h-6" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-[#F3F4F6] truncate">
                      {formData.name || 'Your Website Name'}
                    </h4>
                    <p className="text-xs text-[#9CA3AF] truncate mt-0.5">
                      {formData.tagline || 'Your catchy tagline will show up here'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed bg-[#1E2024] p-3 rounded-lg border border-[#33373D]">
                  {formData.description ||
                    'Detailed description of your service, features, and content offerings.'}
                </p>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="px-2.5 py-1 rounded-md bg-[#26292F] text-[#F3F4F6] font-medium border border-[#33373D]">
                    {selectedCategory?.name || 'Category'}
                  </span>
                  <span className="text-[#22C55E] font-medium flex items-center gap-1.5 font-mono text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Community & Social Links */}
            <div className="bg-[#1E2024] rounded-xl border border-[#33373D] p-6 shadow-sm space-y-5">
              <h2 className="text-base font-semibold text-[#F3F4F6] border-b border-[#33373D] pb-3">
                Community & Social Links
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
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
                    className="w-full h-11 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-mono text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
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
                    className="w-full h-11 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-mono text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#0B9DF7] hover:bg-[#0A8FE0] text-white font-semibold text-sm transition-colors disabled:opacity-50 shadow-md"
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
        </div>
      </form>
    </div>
  );
}
