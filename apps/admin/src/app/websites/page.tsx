'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import type { WebsiteCard } from '@findfunlinks/contracts';
import {
  Search,
  ShieldAlert,
  Archive,
  CheckCircle,
  Trash2,
  Loader2,
  RotateCcw,
} from 'lucide-react';

export default function WebsitesAdminPage() {
  const [websites, setWebsites] = useState<WebsiteCard[]>([]);
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
      setWebsites(res.items || []);
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
          <h1 className="text-2xl font-black text-foreground">Websites Directory</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage public directory listings, toggle featured statuses, and moderate website access.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchWebsites}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors self-start sm:self-auto"
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
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWebsites()}
            placeholder="Search websites by name or slug..."
            className="w-full rounded-xl border border-input bg-background pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : websites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                  <th className="py-3 px-4 font-semibold">Website</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Live Mirrors</th>
                  <th className="py-3 px-4 font-semibold">Visits</th>
                  <th className="py-3 px-4 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {websites.map((site) => (
                  <tr key={site.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{site.name}</span>
                        {site.isFeatured && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-brand-orange-500/10 text-brand-orange-600 font-bold border border-brand-orange-500/20">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground truncate max-w-xs">
                        /website/{site.slug}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">{site.categoryName}</td>

                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={(site as unknown as { status?: string }).status || 'ACTIVE'}
                      />
                    </td>

                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {site.activeDomainsCount || 1} mirrors
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">{site.viewCount || 0}</td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        disabled={updatingId === site.id}
                        onClick={() => handleUpdateStatus(site.id, 'ACTIVE')}
                        className="p-1.5 rounded-lg border border-border text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                        title="Activate Website"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === site.id}
                        onClick={() => handleUpdateStatus(site.id, 'SUSPENDED')}
                        className="p-1.5 rounded-lg border border-border text-amber-600 hover:bg-amber-500/10 transition-colors"
                        title="Suspend Website"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === site.id}
                        onClick={() => handleUpdateStatus(site.id, 'ARCHIVED')}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
                        title="Archive Website"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === site.id}
                        onClick={() => handleDelete(site.id, site.name)}
                        className="p-1.5 rounded-lg border border-border text-rose-600 hover:bg-rose-500/10 transition-colors"
                        title="Soft Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-xs text-muted-foreground">
            No websites found matching this filter.
          </div>
        )}
      </div>
    </div>
  );
}
