'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import type { Tag } from '@finallinks/contracts';
import { Tag as TagIcon, Plus, Trash2, RotateCcw, Loader2 } from 'lucide-react';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

export default function TagsAdminPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleConfirmDelete = async () => {
    if (!deletingTag) return;
    try {
      setDeleteLoading(true);
      await api.admin.deleteTag(deletingTag.id);
      toast.success('Tag deleted.');
      setDeletingTag(null);
      await fetchTags();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">Directory Tags</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Global taxonomy tags used by website owners and visitors for granular filtering.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTags}
          className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Create New Tag */}
      <form
        onSubmit={handleCreate}
        className="flex items-center gap-3 max-w-md rounded-xl border border-[#33373D] bg-[#1E2024] p-2"
      >
        <div className="relative flex-1">
          <TagIcon className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Add new tag (e.g. streaming, ad-free)..."
            className="w-full h-11 bg-transparent pl-10 pr-3 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={creating || !newTagName.trim()}
          className="px-4 h-11 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-white text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span>Add</span>
        </button>
      </form>

      {/* Tags List */}
      <div className="rounded-xl border border-[#33373D] bg-[#1E2024] p-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-[#0B9DF7]" />
          </div>
        ) : tags.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#F3F4F6] hover:border-[#0B9DF7]/50 transition-colors group"
              >
                <span>#{tag.name}</span>
                {tag.websiteCount !== undefined && (
                  <span className="text-xs text-[#9CA3AF]">({tag.websiteCount})</span>
                )}
                <button
                  type="button"
                  onClick={() => setDeletingTag(tag)}
                  className="text-[#6B7280] hover:text-red-400 transition-colors ml-1"
                  title="Delete Tag"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-sm text-[#9CA3AF]">
            No tags created yet. Use the field above to add common website tags.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTag}
        onClose={() => setDeletingTag(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Directory Tag?"
        description="Are you sure you want to remove this tag? It will be unlinked from any associated websites."
        itemName={deletingTag ? `#${deletingTag.name}` : undefined}
        confirmLabel="Delete Tag"
        loading={deleteLoading}
      />
    </div>
  );
}
