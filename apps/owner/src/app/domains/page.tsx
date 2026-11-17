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
      // Sort by sortOrder ascending
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
      if (res.added > 0) {
        toast.success(`Successfully registered ${res.added} mirror domain(s)!`);
      }
      if (res.skipped > 0) {
        toast.warning(
          `${res.skipped} line(s) skipped (already registered, duplicate, or invalid format).`,
        );
      }
      setBulkModalOpen(false);
      setBulkText('');
      fetchDomains();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to bulk import mirrors.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === domains.length - 1) return;

    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    const reordered = [...domains];
    const current = reordered[index];
    const target = reordered[targetIndex];
    if (!current || !target) return;

    reordered[index] = target;
    reordered[targetIndex] = current;

    setDomains(reordered);

    try {
      const items = reordered.map((d, i) => ({ id: d.id, sortOrder: i }));
      await api.owner.reorderDomains(items);
      toast.success('Mirror priorities updated.');
    } catch {
      toast.error('Failed to update mirror ordering.');
      fetchDomains();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Mirrors & Working Links
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Configure all operational mirrors, proxies, and alternate entry points for your website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Bulk Import
          </button>
          <button
            onClick={() => setSingleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Mirror
          </button>
          <button
            onClick={fetchDomains}
            disabled={loading}
            className="p-2 text-xs font-medium rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            title="Refresh domains"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Domains Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-xs uppercase text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4 font-semibold w-12 text-center">Rank</th>
                <th className="py-3 px-4 font-semibold">Hostname & Destination</th>
                <th className="py-3 px-4 font-semibold">Label</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Latency</th>
                <th className="py-3 px-4 font-semibold">Clicks</th>
                <th className="py-3 px-4 font-semibold">Checked</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading mirror links...
                  </td>
                </tr>
              ) : domains.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                    No domain links configured yet.
                  </td>
                </tr>
              ) : (
                domains.map((domain, index) => (
                  <tr
                    key={domain.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(index, 'UP')}
                          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3 text-neutral-500" />
                        </button>
                        <button
                          disabled={index === domains.length - 1}
                          onClick={() => handleMoveOrder(index, 'DOWN')}
                          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3 text-neutral-500" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
                          <Globe className="w-3.5 h-3.5 text-blue-500" />
                          {domain.hostname}
                        </span>
                        <a
                          href={domain.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-neutral-400 hover:text-blue-500 truncate max-w-xs block mt-0.5"
                        >
                          {domain.url}
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {domain.label ? (
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                          {domain.label}
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={domain.type} type="domainType" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={domain.status} />
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-neutral-500">
                      {domain.lastResponseMs !== undefined && domain.lastResponseMs !== null ? (
                        <span
                          className={
                            domain.lastResponseMs < 500
                              ? 'text-emerald-600 font-semibold'
                              : domain.lastResponseMs < 1500
                                ? 'text-amber-600'
                                : 'text-rose-600'
                          }
                        >
                          {domain.lastResponseMs}ms
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-neutral-700 dark:text-neutral-300">
                      {domain.clickCount || 0}
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-400 whitespace-nowrap">
                      {formatTimeAgo(domain.lastCheckedAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleProbeDomain(domain.id)}
                        disabled={probingId === domain.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                      >
                        <Activity
                          className={`w-3.5 h-3.5 ${
                            probingId === domain.id ? 'animate-spin text-blue-500' : ''
                          }`}
                        />
                        {probingId === domain.id ? 'Testing...' : 'Probe Live'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <form onSubmit={handleCreateSingle} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    Add Mirror Domain
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSingleModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Destination URL (Full URL)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://mirror.yourwebsite.com"
                    value={singleForm.url}
                    onChange={(e) => setSingleForm({ ...singleForm, url: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Hostname will be extracted and normalized automatically.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Mirror Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EU Mirror 1, Tor Onion, Cloudflare Proxy"
                    value={singleForm.label || ''}
                    onChange={(e) => setSingleForm({ ...singleForm, label: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Link Type
                  </label>
                  <select
                    value={singleForm.type}
                    onChange={(e) =>
                      setSingleForm({
                        ...singleForm,
                        type: e.target.value as 'PRIMARY' | 'MIRROR' | 'PROXY' | 'ALTERNATE',
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MIRROR">Official Mirror</option>
                    <option value="PROXY">Unblock Proxy</option>
                    <option value="ALTERNATE">Alternate Domain</option>
                    <option value="PRIMARY">Primary Domain</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSingleModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Register Mirror
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Domains Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <form onSubmit={handleCreateBulk} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    Bulk Import Mirror Links
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Paste Links (One URL Per Line)
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder={`https://mirror1.mysite.com\nhttps://mirror2.mysite.org\nhttps://proxy.mysite.net`}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Supports unlimited mirrors. Lines beginning with # are treated as comments.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Default Type For Imported Batch
                  </label>
                  <select
                    value={bulkType}
                    onChange={(e) =>
                      setBulkType(e.target.value as 'MIRROR' | 'PROXY' | 'ALTERNATE')
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MIRROR">Official Mirror</option>
                    <option value="PROXY">Unblock Proxy</option>
                    <option value="ALTERNATE">Alternate Domain</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !bulkText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Import All Links
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
