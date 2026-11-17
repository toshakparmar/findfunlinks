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
          <h1 className="text-2xl font-black text-foreground">Tags Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Curate functional discovery tags across all directory listings.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTags}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Create Tag Bar */}
      <form onSubmit={handleCreate} className="flex gap-2 max-w-md">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name (e.g. Emulator, No Ads, PWA)..."
          className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={creating || !newTagName.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {creating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Add Tag
        </button>
      </form>

      {/* Tags Grid */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tags.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
              >
                <TagIcon className="h-3.5 w-3.5 text-primary" />
                <span>#{tag.name}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(tag)}
                  className="text-muted-foreground hover:text-rose-500 transition-colors ml-1"
                  title="Delete Tag"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-muted-foreground">
            No tags found. Add one above.
          </div>
        )}
      </div>
    </div>
  );
}
