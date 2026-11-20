'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import type { Category } from '@findfunlinks/contracts';
import { FolderKanban, Plus, Trash2, Edit, Loader2, X, RotateCcw } from 'lucide-react';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getCategories();
      setCategories(res || []);
    } catch {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIcon('Folder');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Folder');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error('Name and slug are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await api.admin.updateCategory(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
        });
        toast.success('Category updated.');
      } else {
        await api.admin.createCategory({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
        });
        toast.success('Category created.');
      }
      setModalOpen(false);
      await fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (cat.websiteCount && cat.websiteCount > 0) {
      if (
        !confirm(
          `Warning: This category contains ${cat.websiteCount} active websites. Are you sure you want to delete it?`,
        )
      ) {
        return;
      }
    } else if (!confirm(`Delete category "${cat.name}"?`)) {
      return;
    }

    try {
      await api.admin.deleteCategory(cat.id);
      toast.success('Category deleted.');
      await fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">
            Directory Categories
          </h1>
          <p className="text-xs text-[#A8B3C7] mt-1">
            Organize directory listings into discovery categories with tailored icons and metadata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCategories}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-md shadow-[#2563EB]/25"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          </div>
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-[#1A2442] bg-[#0A1226] p-5 shadow-sm space-y-3 flex flex-col justify-between hover:bg-[#0E182F] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[#2563EB]/15 text-[#3B82F6] border border-[#2563EB]/30">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-[#F1F5F9] text-sm">{cat.name}</h2>
                      <span className="font-mono text-[11px] text-[#3B82F6]">/{cat.slug}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1A2442] text-[#A8B3C7]">
                    {cat.websiteCount || 0} sites
                  </span>
                </div>

                {cat.description && (
                  <p className="text-xs text-[#A8B3C7] mt-3 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#1A2442] flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="px-2.5 py-1 rounded-lg border border-[#1A2442] bg-[#070D1E] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors inline-flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  className="p-1 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-xs text-[#A8B3C7]">
            No categories defined. Click "Add Category" to create one.
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-3xl border border-[#1A2442] bg-[#0A1226] max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A2442] pb-3">
              <h2 className="text-base font-bold text-[#F1F5F9]">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#A8B3C7] hover:text-[#F1F5F9]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, ''),
                      );
                    }
                  }}
                  placeholder="e.g. Free Anime & Manga"
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. anime"
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs font-mono text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short explanation for category cards..."
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1A2442]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#1A2442] bg-[#070D1E] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-md shadow-[#2563EB]/25 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
