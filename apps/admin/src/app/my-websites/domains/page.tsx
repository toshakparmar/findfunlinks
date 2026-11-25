'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api, type DomainItem, type CreateDomainInput } from '../../../lib/api';
import { StatusBadge } from '../../../components/StatusBadge';
import { formatTimeAgo } from '../../../lib/utils';
import {
  Globe,
  Plus,
  RefreshCw,
  Activity,
  ArrowUp,
  ArrowDown,
  Layers,
  X,
  Loader2,
  ExternalLink,
  Search,
  Trash2,
  Edit2,
  Star,
  GripVertical,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function OwnerDomainsPage() {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [probingId, setProbingId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmDomain, setDeleteConfirmDomain] = useState<DomainItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [singleForm, setSingleForm] = useState<CreateDomainInput>({
    url: '',
    label: '',
    type: 'MIRROR',
    isPublic: true,
  });

  const [editForm, setEditForm] = useState<{
    id: string;
    url: string;
    label: string;
    type: 'PRIMARY' | 'MIRROR' | 'PROXY' | 'ALTERNATE';
    isPublic: boolean;
  } | null>(null);

  const [bulkText, setBulkText] = useState('');
  const [bulkType, setBulkType] = useState<'MIRROR' | 'PROXY' | 'ALTERNATE'>('MIRROR');

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.owner.getDomains();
      const sorted = [...res].sort((a, b) => a.sortOrder - b.sortOrder);
      setDomains(sorted);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch domains.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleProbeDomain = async (domainId: string) => {
    setProbingId(domainId);
    try {
      const updated = await api.owner.checkDomain(domainId);
      toast.success(`Domain tested: ${updated.status} (${updated.lastResponseMs || 0}ms)`);
      setDomains((prev) => prev.map((d) => (d.id === domainId ? updated : d)));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Probe check failed.');
    } finally {
      setProbingId(null);
    }
  };

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.url) return;
    if (domains.length >= 5) {
      toast.error('Maximum 5 domains and mirrors allowed per website.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.owner.createDomain(singleForm);
      toast.success(`Mirror ${created.hostname} added successfully!`);
      setSingleModalOpen(false);
      setSingleForm({ url: '', label: '', type: 'MIRROR', isPublic: true });
      fetchDomains();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add mirror domain.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    if (domains.length >= 5) {
      toast.error('Maximum 5 domains and mirrors allowed per website.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.owner.bulkCreateDomains({
        rawLines: bulkText,
        defaultType: bulkType,
        isPublic: true,
      });
      toast.success(`Bulk import completed: ${res.added} added, ${res.skipped} skipped.`);
      setBulkModalOpen(false);
      setBulkText('');
      fetchDomains();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk import failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    setSubmitting(true);
    try {
      await api.owner.updateDomain(editForm.id, {
        url: editForm.url,
        label: editForm.label,
        type: editForm.type,
        isPublic: editForm.isPublic,
      });
      toast.success('Mirror details updated successfully.');
      setEditModalOpen(false);
      setEditForm(null);
      fetchDomains();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update mirror.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimary = async (domain: DomainItem) => {
    try {
      await api.owner.updateDomain(domain.id, { type: 'PRIMARY' });
      toast.success(`"${domain.hostname}" set as Primary mirror!`);
      fetchDomains();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to set primary domain.');
    }
  };

  const handleDeleteDomain = async () => {
    if (!deleteConfirmDomain) return;
    setSubmitting(true);
    try {
      await api.owner.deleteDomain(deleteConfirmDomain.id);
      toast.success(`Domain "${deleteConfirmDomain.hostname}" deleted.`);
      setDeleteConfirmDomain(null);
      fetchDomains();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete domain.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reorder Logic
  const isFilterActive = Boolean(search.trim() || typeFilter !== 'ALL' || statusFilter !== 'ALL');

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= domains.length) return;
    const newItems = [...domains];
    const [moved] = newItems.splice(fromIndex, 1);
    if (moved) {
      newItems.splice(toIndex, 0, moved);
      setDomains(newItems);
    }
  };

  const handleSaveOrder = async () => {
    try {
      setSavingOrder(true);
      const items = domains.map((d, index) => ({ id: d.id, sortOrder: index + 1 }));
      await api.owner.reorderDomains(items);
      toast.success('Mirror display priority order saved successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save order.');
    } finally {
      setSavingOrder(false);
    }
  };

  // Filtered domains
  const filteredDomains = useMemo(() => {
    return domains.filter((d) => {
      if (typeFilter !== 'ALL' && d.type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesHost = d.hostname.toLowerCase().includes(q);
        const matchesUrl = d.url.toLowerCase().includes(q);
        const matchesLabel = d.label ? d.label.toLowerCase().includes(q) : false;
        if (!matchesHost && !matchesUrl && !matchesLabel) return false;
      }
      return true;
    });
  }, [domains, typeFilter, statusFilter, search]);

  return (
    <div className="space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">Mirrors & Links</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Manage public alternative URLs, proxy domains, and prioritize link order for visitors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchDomains}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#F3F4F6] hover:bg-[#26292F] transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-[#0B9DF7]" />
            Refresh
          </button>
          {!isFilterActive && domains.length > 1 && (
            <button
              onClick={handleSaveOrder}
              disabled={savingOrder}
              className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border border-[#0B9DF7] bg-[#0B9DF7]/10 text-sm font-semibold text-[#0B9DF7] hover:bg-[#0B9DF7]/20 transition-colors disabled:opacity-50"
            >
              {savingOrder ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Order
            </button>
          )}
          <button
            onClick={() => {
              if (domains.length >= 5) {
                toast.error('Maximum 5 domains and mirrors allowed per website.');
                return;
              }
              setBulkModalOpen(true);
            }}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#F3F4F6] hover:bg-[#26292F] transition-colors"
          >
            <Layers className="w-4 h-4 text-[#0B9DF7]" />
            Bulk Import
          </button>
          <button
            onClick={() => {
              if (domains.length >= 5) {
                toast.error('Maximum 5 domains and mirrors allowed per website.');
                return;
              }
              setSingleModalOpen(true);
            }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#0B9DF7] hover:bg-[#0A8FE0] text-sm font-semibold text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Mirror {domains.length >= 5 ? '(5/5 limit)' : `(${domains.length}/5)`}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-[#33373D] bg-[#1E2024] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by hostname, URL, or label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#33373D] bg-[#16181B] text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-[#33373D] bg-[#16181B] text-xs font-semibold text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
          >
            <option value="ALL">All Roles</option>
            <option value="PRIMARY">Primary Only</option>
            <option value="MIRROR">Official Mirror</option>
            <option value="PROXY">Proxy</option>
            <option value="ALTERNATE">Alternate Host</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-[#33373D] bg-[#16181B] text-xs font-semibold text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active / Online</option>
            <option value="DOWN">Down / Failing</option>
          </select>

          {isFilterActive && (
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="h-10 px-3 rounded-lg border border-[#33373D] bg-[#16181B] text-xs font-semibold text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="w-full rounded-xl border border-[#33373D] bg-[#1E2024] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-[#F3F4F6]">
            <thead className="bg-[#16181B] text-xs font-semibold uppercase text-[#9CA3AF] border-b border-[#33373D]">
              <tr>
                <th className="py-3.5 px-4 text-center w-14">Order</th>
                <th className="py-3.5 px-5">Hostname / Destination URL</th>
                <th className="py-3.5 px-5">Label</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Latency</th>
                <th className="py-3.5 px-5">Clicks</th>
                <th className="py-3.5 px-5">Last Checked</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#33373D]/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-sm text-[#9CA3AF]">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0B9DF7] mx-auto mb-2" />
                    Loading mirror links...
                  </td>
                </tr>
              ) : filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-sm text-[#9CA3AF]">
                    {isFilterActive
                      ? 'No mirrors match your search filter criteria.'
                      : 'No mirror links registered yet. Add a domain to get started.'}
                  </td>
                </tr>
              ) : (
                filteredDomains.map((domain, index) => (
                  <tr key={domain.id} className="hover:bg-[#26292F] transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      {!isFilterActive ? (
                        <div className="flex items-center justify-center gap-1">
                          <GripVertical className="w-3.5 h-3.5 text-[#6B7280]" />
                          <span className="font-mono text-xs font-bold text-[#9CA3AF]">
                            #{index + 1}
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-[#6B7280]">#{index + 1}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-[#F3F4F6]">
                            {domain.hostname}
                          </span>
                          {domain.type === 'PRIMARY' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0B9DF7]/15 text-[#0B9DF7] border border-[#0B9DF7]/30">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <a
                          href={domain.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-mono text-[#0B9DF7] hover:underline flex items-center gap-1 mt-1 truncate max-w-sm"
                        >
                          <span>{domain.url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-sm">
                      {domain.label ? (
                        <span className="font-medium text-[#F3F4F6]">{domain.label}</span>
                      ) : (
                        <span className="text-[#6B7280] italic">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5">
                      <StatusBadge status={domain.type} type="domainType" />
                    </td>

                    <td className="py-3.5 px-5">
                      <StatusBadge status={domain.status} />
                    </td>

                    <td className="py-3.5 px-5 font-mono text-xs">
                      {domain.lastResponseMs !== undefined && domain.lastResponseMs !== null ? (
                        <span
                          className={
                            domain.lastResponseMs < 500
                              ? 'text-[#22C55E] font-semibold'
                              : domain.lastResponseMs < 1500
                                ? 'text-[#F59E0B] font-semibold'
                                : 'text-[#EF4444] font-semibold'
                          }
                        >
                          {domain.lastResponseMs}ms
                        </span>
                      ) : (
                        <span className="text-[#6B7280]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 font-mono text-sm text-[#F3F4F6]">
                      {domain.clickCount || 0}
                    </td>

                    <td className="py-3.5 px-5 text-xs text-[#9CA3AF] whitespace-nowrap">
                      {formatTimeAgo(domain.lastCheckedAt)}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Move Up/Down Controls (active when no filters applied) */}
                        {!isFilterActive && (
                          <>
                            <button
                              onClick={() => handleMove(index, index - 1)}
                              disabled={index === 0}
                              className="p-1.5 rounded border border-[#33373D] bg-[#16181B] text-[#9CA3AF] hover:text-[#F3F4F6] disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMove(index, index + 1)}
                              disabled={index === domains.length - 1}
                              className="p-1.5 rounded border border-[#33373D] bg-[#16181B] text-[#9CA3AF] hover:text-[#F3F4F6] disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Ping Probe */}
                        <button
                          onClick={() => handleProbeDomain(domain.id)}
                          disabled={probingId === domain.id}
                          className="p-1.5 rounded border border-[#33373D] bg-[#16181B] text-[#9CA3AF] hover:text-[#0B9DF7] disabled:opacity-40"
                          title="Run Latency Probe"
                        >
                          {probingId === domain.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B9DF7]" />
                          ) : (
                            <Activity className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Set as Primary (if not primary) */}
                        {domain.type !== 'PRIMARY' && (
                          <button
                            onClick={() => handleSetPrimary(domain)}
                            className="p-1.5 rounded border border-[#33373D] bg-[#16181B] text-[#9CA3AF] hover:text-[#F59E0B]"
                            title="Set as Primary Mirror"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditForm({
                              id: domain.id,
                              url: domain.url,
                              label: domain.label || '',
                              type: domain.type as any,
                              isPublic: domain.isPublic ?? true,
                            });
                            setEditModalOpen(true);
                          }}
                          className="p-1.5 rounded border border-[#33373D] bg-[#16181B] text-[#9CA3AF] hover:text-[#F3F4F6]"
                          title="Edit Mirror"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmDomain(domain)}
                          className="p-1.5 rounded border border-[#33373D] bg-[#16181B] text-[#9CA3AF] hover:text-[#EF4444]"
                          title="Delete Mirror"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Domain Modal */}
      {editModalOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E2024] border border-[#33373D] rounded-xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-3.5">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#0B9DF7]" />
                <h3 className="font-bold text-base text-[#F3F4F6]">Edit Mirror Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#F3F4F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                  Destination URL *
                </label>
                <input
                  type="url"
                  required
                  value={editForm.url}
                  onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm font-mono text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                  Custom Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. EU Fast Mirror"
                  value={editForm.label}
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                  Mirror Role
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                >
                  <option value="PRIMARY">Primary Mirror</option>
                  <option value="MIRROR">Official Mirror</option>
                  <option value="PROXY">Unblock Proxy</option>
                  <option value="ALTERNATE">Alternate Host</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsPublic"
                  checked={editForm.isPublic}
                  onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                  className="rounded border-[#33373D] bg-[#16181B] text-[#0B9DF7] focus:ring-[#0B9DF7]"
                />
                <label htmlFor="editIsPublic" className="text-xs text-[#F3F4F6] font-medium">
                  Visible to public visitors
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#33373D]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="h-10 px-4 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#9CA3AF] hover:text-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-4 rounded-lg bg-[#0B9DF7] hover:bg-[#0A8FE0] text-sm font-semibold text-white transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E2024] border border-[#33373D] rounded-xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#EF4444]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-[#F3F4F6]">Delete Mirror Link?</h3>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="text-[#F3F4F6] font-mono">{deleteConfirmDomain.hostname}</strong>?
              Visitors will no longer be routed to this mirror.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDomain(null)}
                className="h-9 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-xs font-semibold text-[#9CA3AF] hover:text-[#F3F4F6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDomain}
                disabled={submitting}
                className="h-9 px-3.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-xs font-semibold text-white transition-colors"
              >
                {submitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Domain Modal */}
      {singleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E2024] border border-[#33373D] rounded-xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-3.5">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#0B9DF7]" />
                <h3 className="font-bold text-base text-[#F3F4F6]">Add Mirror Domain</h3>
              </div>
              <button
                type="button"
                onClick={() => setSingleModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#F3F4F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                  Destination URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://mirror.yourwebsite.com"
                  value={singleForm.url}
                  onChange={(e) => setSingleForm({ ...singleForm, url: e.target.value })}
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm font-mono text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] focus:ring-1 focus:ring-[#0B9DF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                  Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. EU Fast Mirror"
                  value={singleForm.label || ''}
                  onChange={(e) => setSingleForm({ ...singleForm, label: e.target.value })}
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] focus:ring-1 focus:ring-[#0B9DF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                  Link Role
                </label>
                <select
                  value={singleForm.type}
                  onChange={(e) =>
                    setSingleForm({
                      ...singleForm,
                      type: e.target.value as 'MIRROR' | 'PROXY' | 'ALTERNATE',
                    })
                  }
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                >
                  <option value="MIRROR">Official Mirror</option>
                  <option value="PROXY">Unblock Proxy</option>
                  <option value="ALTERNATE">Alternate Host</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#33373D]">
                <button
                  type="button"
                  onClick={() => setSingleModalOpen(false)}
                  className="h-10 px-4 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#9CA3AF] hover:text-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-4 rounded-lg bg-[#0B9DF7] hover:bg-[#0A8FE0] text-sm font-semibold text-white transition-colors"
                >
                  {submitting ? 'Adding...' : 'Add Mirror'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E2024] border border-[#33373D] rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-3.5">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0B9DF7]" />
                <h3 className="font-bold text-base text-[#F3F4F6]">Bulk Mirror Import</h3>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#F3F4F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBulk} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                  Default Role for Imported Links
                </label>
                <select
                  value={bulkType}
                  onChange={(e) => setBulkType(e.target.value as 'MIRROR' | 'PROXY' | 'ALTERNATE')}
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                >
                  <option value="MIRROR">Official Mirror</option>
                  <option value="PROXY">Unblock Proxy</option>
                  <option value="ALTERNATE">Alternate Host</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F3F4F6] uppercase mb-1.5">
                  Paste URL List (One per line)
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder={`https://mirror1.mysite.com\nhttps://mirror2.mysite.com\nhttps://proxy.mysite.org`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full p-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-xs font-mono text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] focus:ring-1 focus:ring-[#0B9DF7]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#33373D]">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="h-10 px-4 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#9CA3AF] hover:text-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-4 rounded-lg bg-[#0B9DF7] hover:bg-[#0A8FE0] text-sm font-semibold text-white transition-colors"
                >
                  {submitting ? 'Importing...' : 'Import Mirrors'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
