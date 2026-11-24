'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { CircularLoader, Logo } from '@finallinks/ui';
import { api, type Category } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Search,
  Save,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Star,
  ExternalLink,
  Loader2,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

interface WebsiteRankingItem {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  logoUrl?: string | null;
  categoryId: string;
  category?: { id: string; name: string; slug: string } | null;
  status: string;
  stars: number;
  sortOrder: number;
  viewCount: number;
  domains?: Array<any>;
}

export default function WebsiteRankingPage() {
  const [websites, setWebsites] = useState<WebsiteRankingItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, sitesRes] = await Promise.all([
        api.public.getCategories().catch(() => []),
        api.admin.getWebsites({ limit: 100 }),
      ]);

      setCategories(catsRes);
      const rawSites = (sitesRes?.items || []).map((w: any, idx: number) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        tagline: w.tagline,
        logoUrl: w.logoUrl,
        categoryId: w.categoryId || w.category?.id || '',
        category: w.category,
        status: w.status,
        stars: typeof w.stars === 'number' ? w.stars : 0,
        sortOrder: typeof w.sortOrder === 'number' ? w.sortOrder : idx,
        viewCount: w.viewCount || 0,
        domains: w.domains || [],
      }));

      // Sort by sortOrder initially
      rawSites.sort((a: WebsiteRankingItem, b: WebsiteRankingItem) => a.sortOrder - b.sortOrder);
      setWebsites(rawSites);
      setHasChanges(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load website rankings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter websites by selected category and search query
  const filteredWebsites = useMemo(() => {
    return websites.filter((site) => {
      const matchesCategory =
        selectedCategoryId === 'ALL' || site.categoryId === selectedCategoryId;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        site.name.toLowerCase().includes(q) ||
        site.slug.toLowerCase().includes(q) ||
        (site.tagline && site.tagline.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [websites, selectedCategoryId, searchQuery]);

  // Move item up in the filtered list
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const currentItem = filteredWebsites[index];
    const previousItem = filteredWebsites[index - 1];
    if (!currentItem || !previousItem) return;

    setWebsites((prev) => {
      const copy = [...prev];
      const realIdxA = copy.findIndex((w) => w.id === currentItem.id);
      const realIdxB = copy.findIndex((w) => w.id === previousItem.id);
      if (realIdxA !== -1 && realIdxB !== -1 && copy[realIdxA] && copy[realIdxB]) {
        const tempOrder = copy[realIdxA]!.sortOrder;
        copy[realIdxA]!.sortOrder = copy[realIdxB]!.sortOrder;
        copy[realIdxB]!.sortOrder = tempOrder;
        copy.sort((a, b) => a.sortOrder - b.sortOrder);
      }
      return copy;
    });
    setHasChanges(true);
  };

  // Move item down in the filtered list
  const handleMoveDown = (index: number) => {
    if (index === filteredWebsites.length - 1) return;
    const currentItem = filteredWebsites[index];
    const nextItem = filteredWebsites[index + 1];
    if (!currentItem || !nextItem) return;

    setWebsites((prev) => {
      const copy = [...prev];
      const realIdxA = copy.findIndex((w) => w.id === currentItem.id);
      const realIdxB = copy.findIndex((w) => w.id === nextItem.id);
      if (realIdxA !== -1 && realIdxB !== -1 && copy[realIdxA] && copy[realIdxB]) {
        const tempOrder = copy[realIdxA]!.sortOrder;
        copy[realIdxA]!.sortOrder = copy[realIdxB]!.sortOrder;
        copy[realIdxB]!.sortOrder = tempOrder;
        copy.sort((a, b) => a.sortOrder - b.sortOrder);
      }
      return copy;
    });
    setHasChanges(true);
  };

  // Update stars count directly for a website
  const handleStarChange = async (id: string, delta: number) => {
    const site = websites.find((w) => w.id === id);
    if (!site) return;
    const newStars = Math.max(0, site.stars + delta);

    // Optimistic update
    setWebsites((prev) =>
      prev.map((w) => (w.id === id ? { ...w, stars: newStars } : w)),
    );

    try {
      await api.admin.updateWebsiteStars(id, newStars);
      toast.success(`Updated ${site.name} rating to ${newStars} stars`);
    } catch {
      toast.error('Failed to update star rating.');
      // Rollback
      setWebsites((prev) =>
        prev.map((w) => (w.id === id ? { ...w, stars: site.stars } : w)),
      );
    }
  };

  // Save new ordering sequence
  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const itemsToUpdate =
        selectedCategoryId === 'ALL'
          ? websites.map((w, idx) => ({ id: w.id, sortOrder: idx }))
          : filteredWebsites.map((w, idx) => ({ id: w.id, sortOrder: idx }));

      const catId = selectedCategoryId === 'ALL' ? 'GLOBAL' : selectedCategoryId;
      await api.admin.reorderWebsites(catId, itemsToUpdate);

      setHasChanges(false);
      toast.success('Website display ranking and category sequences saved successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save website sequence.');
    } finally {
      setSaving(false);
    }
  };

  const publicWebUrl = process.env.NEXT_PUBLIC_PUBLIC_WEB_URL || 'http://localhost:3000';

  return (
    <div className="space-y-6 w-full select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">
              Website Ranking & Sequences
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0B9DF7]/15 text-[#0B9DF7] border border-[#0B9DF7]/30">
              Directory Priority
            </span>
          </div>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Reorder website display sequences within categories and calibrate star ratings to showcase top websites.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#0B9DF7]' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={saving || !hasChanges}
            className={`inline-flex items-center gap-2 px-5 h-11 rounded-lg font-semibold text-sm transition-all shadow-md ${
              hasChanges
                ? 'bg-[#0B9DF7] hover:bg-[#0A8FE0] text-white animate-pulse'
                : 'bg-[#26292F] text-[#9CA3AF] cursor-not-allowed border border-[#33373D]'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Order</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Top-Left Search & Top-Right Category Dropdown */}
      <div className="bg-[#1E2024] p-4 rounded-xl border border-[#33373D] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Top-Left Searchbar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search websites by name, tagline, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-[#33373D] bg-[#16181B] text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
          />
        </div>

        {/* Top-Right Category Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#0B9DF7]" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full md:w-64 h-11 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7] cursor-pointer"
          >
            <option value="ALL">All Categories ({websites.length} sites)</option>
            {categories.map((c) => {
              const count = websites.filter((w) => w.categoryId === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Websites Sequence Ranking Table */}
      <div className="bg-[#1E2024] rounded-xl border border-[#33373D] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <CircularLoader size="lg" label="Loading" color="#0B9DF7" />
          </div>
        ) : filteredWebsites.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Globe className="w-8 h-8 text-[#6B7280] mx-auto" />
            <p className="text-sm text-[#D1D5DB] font-medium">No websites found</p>
            <p className="text-xs text-[#9CA3AF]">
              Try adjusting your category selection or clear search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#33373D] bg-[#16181B]/60 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  <th className="py-3.5 px-5 w-24">Order</th>
                  <th className="py-3.5 px-5">Website Listing</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Stars / Rating</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right w-44">Sequence Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#33373D]">
                {filteredWebsites.map((site, index) => {
                  const isFirst = index === 0;
                  const isLast = index === filteredWebsites.length - 1;

                  return (
                    <tr
                      key={site.id}
                      className="hover:bg-[#26292F]/50 transition-colors group"
                    >
                      {/* Order Position Badge */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[#16181B] text-[#0B9DF7] border border-[#33373D]">
                            #{index + 1}
                          </span>
                        </div>
                      </td>

                      {/* Website Name & Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#0B9DF7]/15 border border-[#0B9DF7]/30 flex items-center justify-center font-bold text-sm text-[#0B9DF7] overflow-hidden relative shrink-0">
                            {site.logoUrl ? (
                              <img
                                src={site.logoUrl}
                                alt={site.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                  const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full items-center justify-center p-1.5 ${site.logoUrl ? 'hidden' : 'flex'}`}>
                              <Logo variant="mark" className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#F3F4F6] text-sm">
                                {site.name}
                              </span>
                              <a
                                href={`${publicWebUrl}/website/${site.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#6B7280] hover:text-[#0B9DF7] transition-colors"
                                title="Open public listing"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                            <p className="text-xs text-[#9CA3AF] truncate max-w-sm mt-0.5">
                              {site.tagline || `/${site.slug}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-md bg-[#16181B] text-[#D1D5DB] text-xs font-medium border border-[#33373D]">
                          {site.category?.name || 'Unassigned'}
                        </span>
                      </td>

                      {/* Stars Modifier */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-[#16181B] px-2.5 py-1 rounded-lg border border-[#33373D]">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="font-mono text-xs font-bold text-amber-400">
                              {site.stars}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStarChange(site.id, -1)}
                              disabled={site.stars <= 0}
                              className="w-7 h-7 rounded border border-[#33373D] bg-[#16181B] text-[#9CA3AF] hover:text-white hover:border-[#4B5563] flex items-center justify-center text-xs font-bold transition-colors disabled:opacity-30 cursor-pointer"
                              title="Decrease star"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStarChange(site.id, 1)}
                              className="w-7 h-7 rounded border border-[#33373D] bg-[#16181B] text-amber-400 hover:text-amber-300 hover:border-amber-500/40 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                              title="Add star"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStarChange(site.id, 5)}
                              className="px-2 h-7 rounded border border-[#33373D] bg-[#16181B] text-xs font-semibold text-[#0B9DF7] hover:bg-[#0B9DF7]/10 transition-colors cursor-pointer"
                              title="Add 5 stars"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <StatusBadge status={site.status} />
                      </td>

                      {/* Up / Down Reorder Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={isFirst}
                            className={`p-2 rounded-lg border text-xs transition-colors ${
                              isFirst
                                ? 'border-[#33373D]/40 text-[#4B5563] cursor-not-allowed'
                                : 'border-[#33373D] bg-[#16181B] text-[#D1D5DB] hover:bg-[#26292F] hover:text-[#0B9DF7] cursor-pointer'
                            }`}
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={isLast}
                            className={`p-2 rounded-lg border text-xs transition-colors ${
                              isLast
                                ? 'border-[#33373D]/40 text-[#4B5563] cursor-not-allowed'
                                : 'border-[#33373D] bg-[#16181B] text-[#D1D5DB] hover:bg-[#26292F] hover:text-[#0B9DF7] cursor-pointer'
                            }`}
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
