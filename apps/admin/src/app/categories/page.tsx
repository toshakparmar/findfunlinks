'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import type { Category } from '@finallinks/contracts';
import { FolderKanban, Plus, Trash2, Edit, Loader2, X, RotateCcw } from 'lucide-react';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [homeLimit, setHomeLimit] = useState(10);
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
    setHomeLimit(10);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Folder');
    setHomeLimit(cat.homeLimit ?? 10);
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
          homeLimit: Number(homeLimit) || 10,
        });
        toast.success('Category updated.');
      } else {
        await api.admin.createCategory({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
          homeLimit: Number(homeLimit) || 10,
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

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      setDeleteLoading(true);
      await api.admin.deleteCategory(deletingCategory.id);
      toast.success('Category deleted.');
      setDeletingCategory(null);
      await fetchCategories();
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
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">
            Directory Categories
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Organize directory listings into discovery categories with tailored icons and metadata.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCategories}
            className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 h-11 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-white text-sm font-medium transition-colors"
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
            <Loader2 className="h-7 w-7 animate-spin text-[#0B9DF7]" />
          </div>
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-[#33373D] bg-[#1E2024] p-5 space-y-4 flex flex-col justify-between hover:bg-[#26292F] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#26292F] text-[#0B9DF7] border border-[#33373D]">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-[#F3F4F6] text-base">{cat.name}</h2>
                      <span className="font-mono text-xs text-[#0B9DF7]">/{cat.slug}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#26292F] text-[#9CA3AF] border border-[#33373D]">
                    {cat.websiteCount || 0} sites
                  </span>
                </div>

                {cat.description && (
                  <p className="text-xs text-[#9CA3AF] mt-3 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#33373D] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="px-3 h-8 rounded-lg border border-[#33373D] bg-[#16181B] text-xs font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingCategory(cat)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-sm text-[#9CA3AF]">
            No categories defined. Click &quot;Add Category&quot; to create one.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Directory Category?"
        description={
          deletingCategory?.websiteCount && deletingCategory.websiteCount > 0
            ? `Warning: This category currently contains ${deletingCategory.websiteCount} active website(s). Deleting it may impact visitor discovery.`
            : 'Are you sure you want to remove this category? Websites under this category will need to be recategorized.'
        }
        itemName={deletingCategory ? deletingCategory.name : undefined}
        confirmLabel="Delete Category"
        loading={deleteLoading}
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-[#33373D] bg-[#1E2024] max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-3">
              <h2 className="text-base font-bold text-[#F3F4F6]">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#9CA3AF] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
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
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. anime"
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm font-mono text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short explanation for category cards..."
                  className="w-full rounded-lg border border-[#33373D] bg-[#16181B] p-3 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
                  Home Display Limit (default 10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={homeLimit}
                  onChange={(e) => setHomeLimit(parseInt(e.target.value, 10) || 10)}
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#33373D]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 h-11 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 h-11 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-white text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
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
