'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { AdminSelect } from '@/components/AdminSelect';
import type { Category } from '@finallinks/contracts';
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
  GripVertical,
  ArrowUp,
  ArrowDown,
  Save,
  FolderKanban,
  Plus,
  X,
  Globe,
  User,
  ShieldCheck,
} from 'lucide-react';

interface AdminWebsiteItem {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description: string;
  isFeatured: boolean;
  status: string;
  categoryId?: string;
  categoryName?: string;
  category?: { id: string; name: string; slug: string } | null;
  activeDomainsCount?: number;
  _count?: { domains: number };
}

interface OwnerOption {
  id: string;
  name: string;
  email: string;
  hasWebsite: boolean;
}

export default function WebsitesAdminPage() {
  const [websites, setWebsites] = useState<AdminWebsiteItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Deletion modal state
  const [deletingWebsite, setDeletingWebsite] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Register website modal state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [availableOwners, setAvailableOwners] = useState<OwnerOption[]>([]);
  const [regName, setRegName] = useState('');
  const [regUrl, setRegUrl] = useState('');
  const [regCategoryId, setRegCategoryId] = useState('');
  const [regTagline, setRegTagline] = useState('');
  const [regDescription, setRegDescription] = useState('');
  const [regContentRating, setRegContentRating] = useState<'ALL' | 'MATURE'>('ALL');
  const [ownerMode, setOwnerMode] = useState<'admin' | 'new' | 'existing'>('admin');
  const [regOwnerId, setRegOwnerId] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regOwnerEmail, setRegOwnerEmail] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.admin.getCategories();
      setCategories(res || []);
      if (res && res.length > 0 && !regCategoryId) {
        setRegCategoryId(res[0]?.id || '');
      }
    } catch {
      // Ignore
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await api.admin.getUsers({ limit: 100 });
      const owners: OwnerOption[] = (res.items || [])
        .filter((u: any) => u.role?.type === 'WEBSITE_OWNER')
        .map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          hasWebsite: !!u.website,
        }));
      setAvailableOwners(owners);
      const unassigned = owners.find((o) => !o.hasWebsite);
      if (unassigned) {
        setRegOwnerId(unassigned.id);
      }
    } catch {
      // Ignore
    }
  };

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getWebsites({
        limit: 100,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search.trim() || undefined,
        categoryId: selectedCategoryId === 'ALL' ? undefined : selectedCategoryId,
      });
      setWebsites((res.items as unknown as AdminWebsiteItem[]) || []);
    } catch {
      toast.error('Failed to load websites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (registerModalOpen && ownerMode === 'existing') {
      fetchOwners();
    }
  }, [registerModalOpen, ownerMode]);

  useEffect(() => {
    fetchWebsites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, selectedCategoryId]);

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

  const handleConfirmDelete = async () => {
    if (!deletingWebsite) return;
    try {
      setDeleteLoading(true);
      await api.admin.deleteWebsite(deletingWebsite.id);
      toast.success(`Website "${deletingWebsite.name}" deleted.`);
      setDeletingWebsite(null);
      await fetchWebsites();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regUrl.trim() || !regCategoryId) {
      toast.error('Please enter website name, primary URL, and category.');
      return;
    }

    if (ownerMode === 'new') {
      if (!regOwnerName.trim() || !regOwnerEmail.trim()) {
        toast.error('Please provide owner name and email address.');
        return;
      }
    } else if (ownerMode === 'existing') {
      if (!regOwnerId) {
        toast.error('Please select an unassigned owner user.');
        return;
      }
    }

    try {
      setRegistering(true);
      await api.admin.createWebsite({
        name: regName.trim(),
        primaryUrl: regUrl.trim(),
        categoryId: regCategoryId,
        tagline: regTagline.trim() || undefined,
        description: regDescription.trim() || undefined,
        contentRating: regContentRating,
        createdByAdmin: ownerMode === 'admin',
        ownerId: ownerMode === 'existing' ? regOwnerId : undefined,
        ownerName: ownerMode === 'new' ? regOwnerName.trim() : undefined,
        ownerEmail: ownerMode === 'new' ? regOwnerEmail.trim() : undefined,
      });

      toast.success(
        ownerMode === 'new'
          ? `Website registered! Account credentials emailed to ${regOwnerEmail}.`
          : ownerMode === 'admin'
            ? `Website "${regName.trim()}" registered successfully as Admin Listing!`
            : 'Website registered successfully!',
      );

      setRegisterModalOpen(false);
      setRegName('');
      setRegUrl('');
      setRegTagline('');
      setRegDescription('');
      setRegOwnerName('');
      setRegOwnerEmail('');
      await fetchWebsites();
      await fetchOwners();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  // Reordering helpers (active when a specific category is chosen)
  const isOrderingMode = selectedCategoryId !== 'ALL' && !search.trim();

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= websites.length) return;
    const newItems = [...websites];
    const [moved] = newItems.splice(fromIndex, 1);
    if (moved) {
      newItems.splice(toIndex, 0, moved);
      setWebsites(newItems);
    }
  };

  const handleStarUpdate = async (id: string, delta: number) => {
    const current = websites.find((w) => w.id === id);
    if (!current) return;
    const newStars = Math.max(0, ((current as any).stars || 0) + delta);
    setWebsites((prev) => prev.map((w) => (w.id === id ? { ...w, stars: newStars } : w)));
    try {
      await api.admin.updateWebsiteStars(id, newStars);
      toast.success(`Updated ${current.name} rating to ${newStars} stars`);
    } catch {
      toast.error('Failed to update stars.');
      fetchWebsites();
    }
  };

  const handleSaveOrder = async () => {
    if (!isOrderingMode || selectedCategoryId === 'ALL') return;
    try {
      setSavingOrder(true);
      const items = websites.map((w, index) => ({ id: w.id, sortOrder: index + 1 }));
      await api.admin.reorderWebsites(selectedCategoryId, items);
      toast.success('Display sequence saved successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save order');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleMoveToPosition = (fromIndex: number) => {
    const target = prompt(
      `Enter new position for this website (1 to ${websites.length}):`,
      String(fromIndex + 1),
    );
    if (!target) return;
    const pos = parseInt(target, 10);
    if (isNaN(pos) || pos < 1 || pos > websites.length) {
      toast.error(`Please enter a valid number between 1 and ${websites.length}`);
      return;
    }
    handleMove(fromIndex, pos - 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">Websites Directory</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Manage public directory listings, custom category ordering sequences, and moderation
            states.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {isOrderingMode && (
            <button
              type="button"
              disabled={savingOrder}
              onClick={handleSaveOrder}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {savingOrder ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Sequence</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setRegisterModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 h-11 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-white text-sm font-medium transition-colors shadow-lg shadow-[#0B9DF7]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Register Website</span>
          </button>

          <button
            type="button"
            onClick={fetchWebsites}
            className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWebsites()}
            placeholder="Search by name, tagline, or slug..."
            className="w-full h-11 rounded-lg border border-[#33373D] bg-[#1E2024] pl-10 pr-4 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full">
          <AdminSelect
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            searchable={true}
            placeholder="All Categories"
            prefix={<FolderKanban className="h-4 w-4 text-[#0B9DF7]" />}
            options={[
              { value: 'ALL', label: 'All Categories' },
              ...categories.map((c) => ({
                value: c.id,
                label: c.name,
              })),
            ]}
          />
        </div>

        {/* Status Filter */}
        <div className="w-full">
          <AdminSelect
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Statuses"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active Only' },
              { value: 'PENDING_REVIEW', label: 'Pending Review' },
              { value: 'SUSPENDED', label: 'Suspended' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
          />
        </div>
      </div>

      {/* Info notice about ordering */}
      {isOrderingMode && (
        <div className="rounded-lg border border-[#0B9DF7]/30 bg-[#0B9DF7]/10 p-3.5 text-xs text-[#0B9DF7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            <span>
              <strong>Sequence Mode Active:</strong> Drag rows or use Move buttons to reorder how
              listings appear on the public directory. Click &quot;Save Sequence&quot; when done.
            </span>
          </div>
          <span className="font-mono font-bold">{websites.length} items</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[#33373D] bg-[#1E2024] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-[#0B9DF7]" />
          </div>
        ) : websites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#33373D] bg-[#16181B] text-[#9CA3AF]">
                  {isOrderingMode && (
                    <th className="py-3 px-3 font-medium text-center w-16">Seq</th>
                  )}
                  <th className="py-3 px-4 font-medium">Website</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Stars</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Mirrors</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#33373D]">
                {websites.map((site, index) => {
                  const isDragging = draggedIdx === index;
                  const isDragOver = dragOverIdx === index;

                  return (
                    <tr
                      key={site.id}
                      draggable={isOrderingMode}
                      onDragStart={() => setDraggedIdx(index)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverIdx !== index) setDragOverIdx(index);
                      }}
                      onDragEnd={() => {
                        if (draggedIdx !== null && dragOverIdx !== null) {
                          handleMove(draggedIdx, dragOverIdx);
                        }
                        setDraggedIdx(null);
                        setDragOverIdx(null);
                      }}
                      className={`transition-colors ${
                        isDragging ? 'opacity-40 bg-[#26292F]' : ''
                      } ${
                        isDragOver
                          ? 'border-t-2 border-[#0B9DF7] bg-[#26292F]/80'
                          : 'hover:bg-[#26292F]'
                      }`}
                    >
                      {/* Rank & Drag Handle Column */}
                      {isOrderingMode && (
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span
                              className="cursor-grab text-[#6B7280] hover:text-white"
                              title="Drag to reorder"
                            >
                              <GripVertical className="h-4 w-4" />
                            </span>
                            <span className="font-mono text-xs font-bold text-[#9CA3AF]">
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#F3F4F6]">{site.name}</span>
                          {site.isFeatured && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#9CA3AF] truncate max-w-sm mt-0.5">
                          {site.tagline || site.description}
                        </div>
                        <a
                          href={`/website/${site.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-[#0B9DF7] hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          /{site.slug}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-[#26292F] border border-[#33373D] font-medium text-xs text-[#D1D5DB]">
                          {site.category?.name || site.categoryName || 'Unassigned'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1 bg-[#16181B] px-2 py-0.5 rounded border border-[#33373D]">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-mono text-xs font-bold text-amber-400">
                              {(site as any).stars || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleStarUpdate(site.id, -1)}
                              disabled={!(site as any).stars || (site as any).stars <= 0}
                              className="w-5 h-5 rounded border border-[#33373D] bg-[#16181B] text-[#9CA3AF] hover:text-white flex items-center justify-center text-[10px] font-bold disabled:opacity-30"
                              title="Decrease star"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStarUpdate(site.id, 1)}
                              className="w-5 h-5 rounded border border-[#33373D] bg-[#16181B] text-amber-400 hover:text-amber-300 flex items-center justify-center text-[10px] font-bold"
                              title="Increase star"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={site.status} />
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono text-[#9CA3AF]">
                        {site.activeDomainsCount ?? site._count?.domains ?? 0} mirrors
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isOrderingMode && (
                            <div className="flex items-center gap-1 mr-2 border-r border-[#33373D] pr-2">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMove(index, index - 1)}
                                className="p-1.5 rounded-lg border border-[#33373D] text-[#9CA3AF] hover:text-white hover:bg-[#26292F] disabled:opacity-30"
                                title="Move Up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === websites.length - 1}
                                onClick={() => handleMove(index, index + 1)}
                                className="p-1.5 rounded-lg border border-[#33373D] text-[#9CA3AF] hover:text-white hover:bg-[#26292F] disabled:opacity-30"
                                title="Move Down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveToPosition(index)}
                                className="px-2 py-1 rounded-lg border border-[#33373D] text-[11px] font-mono text-[#9CA3AF] hover:text-white hover:bg-[#26292F]"
                                title="Move to specific position"
                              >
                                Pos…
                              </button>
                            </div>
                          )}

                          {site.status !== 'ACTIVE' && (
                            <button
                              type="button"
                              disabled={updatingId === site.id}
                              onClick={() => handleUpdateStatus(site.id, 'ACTIVE')}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors border border-emerald-500/30"
                              title="Activate Listing"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}

                          {site.status !== 'SUSPENDED' && (
                            <button
                              type="button"
                              disabled={updatingId === site.id}
                              onClick={() => handleUpdateStatus(site.id, 'SUSPENDED')}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/30"
                              title="Suspend Listing"
                            >
                              <ShieldAlert className="h-4 w-4" />
                            </button>
                          )}

                          {site.status !== 'ARCHIVED' && (
                            <button
                              type="button"
                              disabled={updatingId === site.id}
                              onClick={() => handleUpdateStatus(site.id, 'ARCHIVED')}
                              className="p-2 rounded-lg bg-[#26292F] text-[#9CA3AF] hover:bg-[#33373D] hover:text-[#F3F4F6] transition-colors border border-[#33373D]"
                              title="Archive Listing"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={updatingId === site.id}
                            onClick={() => setDeletingWebsite({ id: site.id, name: site.name })}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-[#9CA3AF]">
            No websites found matching your search.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingWebsite}
        onClose={() => setDeletingWebsite(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Website Listing?"
        description="Are you sure you want to remove this website directory listing? All associated mirror links will be unlisted."
        itemName={deletingWebsite ? deletingWebsite.name : undefined}
        confirmLabel="Delete Website"
        loading={deleteLoading}
      />

      {/* Register Website Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-[#33373D] bg-[#1E2024] p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-3.5">
              <div className="flex items-center gap-2.5">
                <Globe className="h-5 w-5 text-[#0B9DF7]" />
                <h3 className="text-lg font-bold text-[#F3F4F6] tracking-tight">
                  Register New Website
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRegisterModalOpen(false)}
                className="text-[#9CA3AF] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                    Website Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. AnimeWave Portal"
                    className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                    Primary Mirror URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUrl}
                    onChange={(e) => setRegUrl(e.target.value)}
                    placeholder="https://animewave.org"
                    className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    required
                    value={regCategoryId}
                    onChange={(e) => setRegCategoryId(e.target.value)}
                    className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3 text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7] transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                    Content Rating
                  </label>
                  <select
                    value={regContentRating}
                    onChange={(e) => setRegContentRating(e.target.value as 'ALL' | 'MATURE')}
                    className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3 text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7] transition-colors"
                  >
                    <option value="ALL">Everyone (ALL)</option>
                    <option value="MATURE">Mature (18+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                  Tagline (Optional)
                </label>
                <input
                  type="text"
                  value={regTagline}
                  onChange={(e) => setRegTagline(e.target.value)}
                  placeholder="Fastest anime streams and downloads..."
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={regDescription}
                  onChange={(e) => setRegDescription(e.target.value)}
                  placeholder="Comprehensive directory description and features..."
                  className="w-full rounded-lg border border-[#33373D] bg-[#16181B] p-3 text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors resize-none"
                />
              </div>

              {/* Owner Assignment Mode */}
              <div className="pt-2 border-t border-[#33373D] space-y-3">
                <span className="block text-xs font-bold text-[#F3F4F6] uppercase tracking-wider">
                  Owner Account Assignment
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOwnerMode('admin')}
                    className={`h-11 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 px-2 ${
                      ownerMode === 'admin'
                        ? 'border-[#0B9DF7] bg-[#0B9DF7]/15 text-[#0B9DF7]'
                        : 'border-[#33373D] bg-[#16181B] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Created by Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOwnerMode('new')}
                    className={`h-11 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 px-2 ${
                      ownerMode === 'new'
                        ? 'border-[#0B9DF7] bg-[#0B9DF7]/15 text-[#0B9DF7]'
                        : 'border-[#33373D] bg-[#16181B] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    <User className="h-4 w-4 shrink-0" />
                    <span>Create New Owner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOwnerMode('existing')}
                    className={`h-11 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 px-2 ${
                      ownerMode === 'existing'
                        ? 'border-[#0B9DF7] bg-[#0B9DF7]/15 text-[#0B9DF7]'
                        : 'border-[#33373D] bg-[#16181B] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    <User className="h-4 w-4 shrink-0" />
                    <span>Assign Existing Owner</span>
                  </button>
                </div>

                {ownerMode === 'admin' ? (
                  <div className="space-y-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span>Created by Admin (Direct Platform Listing)</span>
                    </div>
                    <p className="text-[11px] text-[#D1D5DB] leading-relaxed">
                      This website will be registered directly as an official platform directory
                      listing. No owner name, email, or external account credentials are required.
                    </p>
                  </div>
                ) : ownerMode === 'new' ? (
                  <div className="space-y-3 rounded-xl border border-[#33373D] bg-[#16181B] p-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                          Owner Full Name *
                        </label>
                        <input
                          type="text"
                          required={ownerMode === 'new'}
                          value={regOwnerName}
                          onChange={(e) => setRegOwnerName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full h-10 rounded-lg border border-[#33373D] bg-[#1E2024] px-3 text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                          Owner Email * (Credentials sent here)
                        </label>
                        <input
                          type="email"
                          required={ownerMode === 'new'}
                          value={regOwnerEmail}
                          onChange={(e) => setRegOwnerEmail(e.target.value)}
                          placeholder="owner@example.com"
                          className="w-full h-10 rounded-lg border border-[#33373D] bg-[#1E2024] px-3 text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] text-xs"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                      💡 A secure temporary password will be generated and dispatched to this email
                      immediately.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 rounded-xl border border-[#33373D] bg-[#16181B] p-3.5">
                    <label className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                      Select Available Owner *
                    </label>
                    <select
                      value={regOwnerId}
                      onChange={(e) => setRegOwnerId(e.target.value)}
                      className="w-full h-10 rounded-lg border border-[#33373D] bg-[#1E2024] px-3 text-[#F3F4F6] text-xs focus:outline-none focus:border-[#0B9DF7]"
                    >
                      {availableOwners.filter((o) => !o.hasWebsite).length === 0 && (
                        <option value="">No unassigned owners available</option>
                      )}
                      {availableOwners
                        .filter((o) => !o.hasWebsite)
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name} ({o.email})
                          </option>
                        ))}
                    </select>
                    {availableOwners.filter((o) => !o.hasWebsite).length === 0 && (
                      <p className="text-[11px] text-amber-400">
                        All existing owners already manage a website. Please select &quot;Create New
                        Owner&quot; or &quot;Created by Admin&quot;.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#33373D]">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="h-11 px-5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-semibold text-[#D1D5DB] hover:bg-[#26292F] hover:text-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="h-11 px-5 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#0B9DF7]/20 disabled:opacity-50"
                >
                  {registering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register Website</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
