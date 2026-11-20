'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api, type DomainItem, type CreateDomainInput } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import { formatTimeAgo } from '../../lib/utils';
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
} from 'lucide-react';
import { toast } from 'sonner';

export default function OwnerDomainsPage() {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [probingId, setProbingId] = useState<string | null>(null);

  // Modals state
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Single domain form
  const [singleForm, setSingleForm] = useState<CreateDomainInput>({
    url: '',
    label: '',
    type: 'MIRROR',
    isPublic: true,
  });

  // Bulk domain form
  const [bulkText, setBulkText] = useState('');
  const [bulkType, setBulkType] = useState<'MIRROR' | 'PROXY' | 'ALTERNATE'>('MIRROR');

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.owner.getDomains();
      const sorted = [...res].sort((a, b) => a.sortOrder - b.sortOrder);
      setDomains(sorted);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch domains.';
      toast.error(message);
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
      const message = err instanceof Error ? err.message : 'Probe check failed.';
      toast.error(message);
    } finally {
      setProbingId(null);
    }
  };

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.url) return;
    setSubmitting(true);
    try {
      const created = await api.owner.createDomain(singleForm);
      toast.success(`Mirror ${created.hostname} added successfully!`);
      setSingleModalOpen(false);
      setSingleForm({ url: '', label: '', type: 'MIRROR', isPublic: true });
      fetchDomains();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add mirror domain.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

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
      const message = err instanceof Error ? err.message : 'Bulk import failed.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= domains.length) return;

    const newOrder = [...domains];
    const [moved] = newOrder.splice(index, 1);
    if (!moved) return;
    newOrder.splice(targetIndex, 0, moved);

    const payload = newOrder.map((d, i) => ({ id: d.id, sortOrder: i }));
    setDomains(newOrder);

    try {
      await api.owner.reorderDomains(payload);
      toast.success('Domain priority updated.');
    } catch {
      toast.error('Failed to update domain order.');
      fetchDomains();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">
            Mirrors & Working Domains
          </h1>
          <p className="text-xs text-[#A8B3C7] mt-1">
            Ensure uninterrupted visitor access by managing your primary domain, backup mirrors, and
            proxies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDomains}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#070D1E] text-xs font-semibold text-[#F1F5F9] hover:bg-[#0E182F] transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#3B82F6]" />
            Bulk Import
          </button>
          <button
            type="button"
            onClick={() => setSingleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-md shadow-[#2563EB]/25"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Mirror
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1A2442] bg-[#0A1226] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F1F5F9]">
            <thead className="bg-[#070D1E] text-[11px] uppercase text-[#A8B3C7] border-b border-[#1A2442]">
              <tr>
                <th className="py-3 px-3 text-center w-12">Rank</th>
                <th className="py-3 px-4 font-semibold">Hostname / URL</th>
                <th className="py-3 px-4 font-semibold">Label</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Latency</th>
                <th className="py-3 px-4 font-semibold">Clicks</th>
                <th className="py-3 px-4 font-semibold">Checked</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2442]/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#A8B3C7]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#3B82F6]" />
                    Loading mirror links...
                  </td>
                </tr>
              ) : domains.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#A8B3C7]">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-[#6B7893]" />
                    No domain links configured yet. Click "Add Mirror" to configure your first
                    mirror.
                  </td>
                </tr>
              ) : (
                domains.map((domain, index) => (
                  <tr key={domain.id} className="hover:bg-[#0E182F] transition-colors">
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(index, 'UP')}
                          className="p-1 rounded text-[#A8B3C7] hover:bg-[#1A2442] hover:text-[#F1F5F9] disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={index === domains.length - 1}
                          onClick={() => handleMoveOrder(index, 'DOWN')}
                          className="p-1 rounded text-[#A8B3C7] hover:bg-[#1A2442] hover:text-[#F1F5F9] disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#F1F5F9] flex items-center gap-1.5 text-xs">
                          <Globe className="w-3.5 h-3.5 text-[#3B82F6]" />
                          {domain.hostname}
                          {domain.type === 'PRIMARY' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#2563EB]/15 text-[#3B82F6] border border-[#2563EB]/30">
                              PRIMARY
                            </span>
                          )}
                        </span>
                        <a
                          href={domain.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-[#3B82F6] hover:underline truncate max-w-xs block mt-0.5"
                        >
                          {domain.url}
                        </a>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {domain.label ? (
                        <span className="font-medium text-[#F1F5F9]">{domain.label}</span>
                      ) : (
                        <span className="text-[#6B7893] italic">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={domain.type} type="domainType" />
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={domain.status} />
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {domain.lastResponseMs !== undefined && domain.lastResponseMs !== null ? (
                        <span
                          className={
                            domain.lastResponseMs < 500
                              ? 'text-[#22C55E] font-semibold'
                              : domain.lastResponseMs < 1500
                                ? 'text-[#F59E0B]'
                                : 'text-[#EF4444]'
                          }
                        >
                          {domain.lastResponseMs}ms
                        </span>
                      ) : (
                        <span className="text-[#6B7893]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[#F1F5F9]">{domain.clickCount || 0}</td>

                    <td className="py-3 px-4 text-[#A8B3C7] whitespace-nowrap">
                      {formatTimeAgo(domain.lastCheckedAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleProbeDomain(domain.id)}
                        disabled={probingId === domain.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2563EB]/15 text-[#3B82F6] hover:bg-[#2563EB] hover:text-white transition-colors border border-[#2563EB]/30 disabled:opacity-50"
                      >
                        {probingId === domain.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Activity className="w-3.5 h-3.5" />
                        )}
                        <span>{probingId === domain.id ? 'Testing...' : 'Ping'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single Domain Modal */}
      {singleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A1226] border border-[#1A2442] rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1A2442] pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#3B82F6]" />
                <h3 className="font-bold text-base text-[#F1F5F9]">Add Mirror Domain</h3>
              </div>
              <button
                type="button"
                onClick={() => setSingleModalOpen(false)}
                className="text-[#A8B3C7] hover:text-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  Destination URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://mirror.yourwebsite.com"
                  value={singleForm.url}
                  onChange={(e) => setSingleForm({ ...singleForm, url: e.target.value })}
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  Display Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. EU Fast Mirror, Backup Server 2"
                  value={singleForm.label || ''}
                  onChange={(e) => setSingleForm({ ...singleForm, label: e.target.value })}
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  Domain Type
                </label>
                <select
                  value={singleForm.type}
                  onChange={(e) =>
                    setSingleForm({
                      ...singleForm,
                      type: e.target.value as 'MIRROR' | 'PROXY' | 'ALTERNATE',
                    })
                  }
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                >
                  <option value="MIRROR">Official Mirror</option>
                  <option value="PROXY">Unblock Proxy</option>
                  <option value="ALTERNATE">Alternate Domain</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1A2442]">
                <button
                  type="button"
                  onClick={() => setSingleModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#1A2442] bg-[#070D1E] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-md shadow-[#2563EB]/25 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Register Mirror
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A1226] border border-[#1A2442] rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1A2442] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#3B82F6]" />
                <h3 className="font-bold text-base text-[#F1F5F9]">Bulk Import Mirror Domains</h3>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="text-[#A8B3C7] hover:text-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBulk} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  URLs (One per line)
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={`https://mirror1.mysite.com\nhttps://mirror2.mysite.com\nhttps://unblock.mysite.org`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs font-mono text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  Assign Type
                </label>
                <select
                  value={bulkType}
                  onChange={(e) => setBulkType(e.target.value as 'MIRROR' | 'PROXY' | 'ALTERNATE')}
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                >
                  <option value="MIRROR">Official Mirror</option>
                  <option value="PROXY">Unblock Proxy</option>
                  <option value="ALTERNATE">Alternate Domain</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1A2442]">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#1A2442] bg-[#070D1E] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-md shadow-[#2563EB]/25 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Import All Domains
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
