'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import type { Tag } from '@findfunlinks/contracts';
import { Tag as TagIcon, Plus, Trash2, RotateCcw, Loader2 } from 'lucide-react';

export default function TagsAdminPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getTags();
      setTags(res || []);
    } catch {
      toast.error('Failed to load tags.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      setCreating(true);
      await api.admin.createTag(newTagName.trim());
      toast.success('Tag created.');
      setNewTagName('');
      await fetchTags();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Create failed.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Delete tag "#${tag.name}"?`)) return;

    try {
      await api.admin.deleteTag(tag.id);
      toast.success('Tag deleted.');
      await fetchTags();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">Directory Tags</h1>
          <p className="text-xs text-[#A8B3C7] mt-1">
            Global taxonomy tags used by website owners and visitors for granular filtering.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTags}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Create New Tag */}
      <form
        onSubmit={handleCreate}
        className="flex items-center gap-2 max-w-md rounded-2xl border border-[#1A2442] bg-[#0A1226] p-2"
      >
        <div className="relative flex-1">
          <TagIcon className="h-4 w-4 text-[#6B7893] absolute left-3 top-2.5" />
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Add new tag (e.g. streaming, ad-free)..."
            className="w-full bg-transparent pl-9 pr-3 py-1.5 text-xs text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={creating || !newTagName.trim()}
          className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1 shadow-sm"
        >
          {creating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          <span>Add</span>
        </button>
      </form>

      {/* Tags List */}
      <div className="rounded-2xl border border-[#1A2442] bg-[#0A1226] p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          </div>
        ) : tags.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#070D1E] text-xs font-medium text-[#F1F5F9] hover:border-[#2563EB]/40 transition-colors group"
              >
                <span>#{tag.name}</span>
                {tag.websiteCount !== undefined && (
                  <span className="text-[10px] text-[#A8B3C7]">({tag.websiteCount})</span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(tag)}
                  className="text-[#6B7893] hover:text-[#EF4444] transition-colors ml-1"
                  title="Delete Tag"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-[#A8B3C7]">
            No tags created yet. Use the field above to add common website tags.
          </div>
        )}
      </div>
    </div>
  );
}
