'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Search,
  ShieldAlert,
  Archive,
  CheckCircle,
  Trash2,
  Loader2,
  RotateCcw,
  ExternalLink,
  Star,
} from 'lucide-react';

interface AdminWebsiteItem {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description: string;
  isFeatured: boolean;
  status: string;
  categoryName?: string;
  category?: { id: string; name: string; slug: string } | null;
  activeDomainsCount?: number;
  _count?: { domains: number };
}

export default function WebsitesAdminPage() {
  const [websites, setWebsites] = useState<AdminWebsiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getWebsites({
        limit: 100,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setWebsites((res.items as unknown as AdminWebsiteItem[]) || []);
    } catch {
      toast.error('Failed to load websites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await api.admin.updateWebsiteStatus(id, newStatus);
      toast.success(`Website status updated to ${newStatus}`);
      await fetchWebsites();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Status update failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to soft-delete "${name}"?`)) return;

    try {
      setUpdatingId(id);
      await api.admin.deleteWebsite(id);
      toast.success('Website deleted.');
      await fetchWebsites();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">Websites Directory</h1>
          <p className="text-xs text-[#A8B3C7] mt-1">
            Manage public directory listings, toggle featured statuses, and moderate website access.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchWebsites}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'ACTIVE', 'PENDING_REVIEW', 'SUSPENDED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'border border-[#1A2442] bg-[#0A1226] text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="h-4 w-4 text-[#6B7893] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWebsites()}
            placeholder="Search by name, tag, or slug..."
            className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] pl-9 pr-3.5 py-2 text-xs text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1A2442] bg-[#0A1226] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          </div>
        ) : websites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1A2442] bg-[#070D1E] text-[#A8B3C7]">
                  <th className="py-3 px-4 font-semibold">Website</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Active Mirrors</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2442]/60">
                {websites.map((site) => (
                  <tr key={site.id} className="hover:bg-[#0E182F] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F1F5F9]">{site.name}</span>
                        {site.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 inline-flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#A8B3C7] truncate max-w-sm">
                        {site.tagline || site.description}
                      </div>
                      <a
                        href={`http://localhost:3000/website/${site.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-[#3B82F6] hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        /{site.slug}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </td>

                    <td className="py-3.5 px-4 text-[#A8B3C7]">
                      <span className="px-2 py-0.5 rounded-lg bg-[#070D1E] border border-[#1A2442] font-semibold text-[11px] text-[#F1F5F9]">
                        {site.category?.name || site.categoryName || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#F1F5F9]">
                      <span className="font-bold text-[#22C55E]">
                        {site.activeDomainsCount || site._count?.domains || 1}
                      </span>{' '}
                      <span className="text-[#A8B3C7]">mirrors</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={site.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {site.status !== 'ACTIVE' && (
                          <button
                            type="button"
                            disabled={updatingId === site.id}
                            onClick={() => handleUpdateStatus(site.id, 'ACTIVE')}
                            className="p-1.5 rounded-lg bg-[#22C55E]/15 text-[#22C55E] hover:bg-[#22C55E] hover:text-white transition-colors border border-[#22C55E]/30"
                            title="Activate Listing"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {site.status !== 'SUSPENDED' && (
                          <button
                            type="button"
                            disabled={updatingId === site.id}
                            onClick={() => handleUpdateStatus(site.id, 'SUSPENDED')}
                            className="p-1.5 rounded-lg bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors border border-[#EF4444]/30"
                            title="Suspend Listing"
                          >
                            <ShieldAlert className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {site.status !== 'ARCHIVED' && (
                          <button
                            type="button"
                            disabled={updatingId === site.id}
                            onClick={() => handleUpdateStatus(site.id, 'ARCHIVED')}
                            className="p-1.5 rounded-lg bg-[#1A2442] text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors border border-[#1A2442]"
                            title="Archive Listing"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={updatingId === site.id}
                          onClick={() => handleDelete(site.id, site.name)}
                          className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#A8B3C7]">
            No websites found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
