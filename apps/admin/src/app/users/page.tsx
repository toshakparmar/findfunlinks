'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import type { Category } from '@finallinks/contracts';
import {
  Users,
  Shield,
  ShieldCheck,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  Loader2,
  UserPlus,
  Trash2,
  X,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED';
  lastLoginAt?: string | null;
  createdAt: string;
  role?: {
    id: string;
    name: string;
    type: 'SUPER_ADMIN' | 'WEBSITE_OWNER' | 'CUSTOM';
  } | null;
  website?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface RoleItem {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  permissions: Array<{
    permission: {
      id: string;
      key: string;
      module: string;
      description?: string | null;
    };
  }>;
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES'>('USERS');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Deletion state
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Create Owner modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [includeWebsite, setIncludeWebsite] = useState(true);
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [siteCategoryId, setSiteCategoryId] = useState('');
  const [siteTagline, setSiteTagline] = useState('');
  const [siteDescription, setSiteDescription] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getUsers({
        page,
        limit: 20,
        search: search || undefined,
      });
      setUsers(res.items);
      setTotalPages(res.totalPages || 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load users';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getRoles();
      setRoles(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load roles';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.admin.getCategories();
      setCategories(res || []);
      if (res && res.length > 0 && !siteCategoryId) {
        setSiteCategoryId(res[0]?.id || '');
      }
    } catch {
      // Ignore
    }
  }, [siteCategoryId]);

  useEffect(() => {
    if (activeTab === 'USERS') {
      fetchUsers();
    } else {
      fetchRoles();
    }
  }, [activeTab, fetchUsers, fetchRoles]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleToggleStatus = async (user: UserRecord) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoadingId(user.id);
    try {
      await api.admin.setUserStatus(user.id, newStatus);
      toast.success(`User marked as ${newStatus.toLowerCase()}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: newStatus as 'ACTIVE' | 'SUSPENDED' | 'INVITED' } : u,
        ),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user status';
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      setDeleteLoading(true);
      await api.admin.deleteUser(deletingUser.id);
      toast.success(`User account "${deletingUser.email}" deleted.`);
      setDeletingUser(null);
      await fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !ownerEmail.trim()) {
      toast.error('Please enter name and email.');
      return;
    }

    if (includeWebsite && (!siteName.trim() || !siteUrl.trim())) {
      toast.error('Please enter website name and URL, or uncheck website registration.');
      return;
    }

    try {
      setCreating(true);
      await api.admin.createUser({
        name: ownerName.trim(),
        email: ownerEmail.trim(),
        websiteName: includeWebsite ? siteName.trim() : undefined,
        websiteUrl: includeWebsite ? siteUrl.trim() : undefined,
        categoryId: includeWebsite ? siteCategoryId : undefined,
        tagline: includeWebsite ? siteTagline.trim() || undefined : undefined,
        description: includeWebsite ? siteDescription.trim() || undefined : undefined,
      });

      toast.success(`Website Owner created! Login credentials dispatched to ${ownerEmail}.`);

      setCreateModalOpen(false);
      setOwnerName('');
      setOwnerEmail('');
      setSiteName('');
      setSiteUrl('');
      setSiteTagline('');
      setSiteDescription('');
      await fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create owner user.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">
            Users & Access Control
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Manage Super Admin and Website Owner platform credentials, RBAC roles, and login access.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {activeTab === 'USERS' && (
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-white text-sm font-medium transition-colors shadow-lg shadow-[#0B9DF7]/20"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Owner User</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => (activeTab === 'USERS' ? fetchUsers() : fetchRoles())}
            className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#33373D] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-2 px-4 h-11 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'USERS'
              ? 'bg-[#0B9DF7] text-white'
              : 'border border-[#33373D] bg-[#1E2024] text-[#9CA3AF] hover:bg-[#26292F] hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          Users Directory
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ROLES')}
          className={`flex items-center gap-2 px-4 h-11 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'ROLES'
              ? 'bg-[#0B9DF7] text-white'
              : 'border border-[#33373D] bg-[#1E2024] text-[#9CA3AF] hover:bg-[#26292F] hover:text-white'
          }`}
        >
          <Shield className="h-4 w-4" />
          Roles & Permissions
        </button>
      </div>

      {activeTab === 'USERS' ? (
        <>
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full h-11 rounded-lg border border-[#33373D] bg-[#1E2024] pl-10 pr-4 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
            />
          </div>

          {/* Table */}
          <div className="rounded-xl border border-[#33373D] bg-[#1E2024] overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-7 w-7 animate-spin text-[#0B9DF7]" />
              </div>
            ) : users.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#33373D] bg-[#16181B] text-[#9CA3AF]">
                        <th className="py-3 px-4 font-medium">User</th>
                        <th className="py-3 px-4 font-medium">Role</th>
                        <th className="py-3 px-4 font-medium">Managed Website</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium">Joined</th>
                        <th className="py-3 px-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#33373D]">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#26292F] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#F3F4F6]">{u.name}</div>
                            <div className="text-xs font-mono text-[#9CA3AF] mt-0.5">{u.email}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                                u.role?.type === 'SUPER_ADMIN'
                                  ? 'bg-[#26292F] text-[#0B9DF7] border-[#33373D]'
                                  : 'bg-[#16181B] text-[#9CA3AF] border-[#33373D]'
                              }`}
                            >
                              <Shield className="h-3.5 w-3.5" />
                              {u.role?.name || 'Owner'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-[#9CA3AF]">
                            {u.website ? (
                              <span className="font-medium text-[#F3F4F6]">{u.website.name}</span>
                            ) : (
                              <span className="text-[#6B7280]">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <StatusBadge status={u.status} />
                          </td>

                          <td className="py-3.5 px-4 text-[#9CA3AF] text-xs font-mono">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {u.role?.type !== 'SUPER_ADMIN' && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  disabled={actionLoadingId === u.id}
                                  onClick={() => handleToggleStatus(u)}
                                  className={`px-3 h-8 rounded-lg border transition-colors inline-flex items-center gap-1.5 text-xs font-medium ${
                                    u.status === 'ACTIVE'
                                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                  }`}
                                  title={u.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                                >
                                  {u.status === 'ACTIVE' ? (
                                    <Lock className="h-3.5 w-3.5" />
                                  ) : (
                                    <Unlock className="h-3.5 w-3.5" />
                                  )}
                                  <span>{u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeletingUser(u)}
                                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                                  title="Delete User Account"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-[#33373D] bg-[#16181B] text-sm text-[#9CA3AF]">
                    <span>
                      Page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-3 h-8 rounded-lg border border-[#33373D] bg-[#1E2024] text-[#D1D5DB] disabled:opacity-40 hover:bg-[#26292F]"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 h-8 rounded-lg border border-[#33373D] bg-[#1E2024] text-[#D1D5DB] disabled:opacity-40 hover:bg-[#26292F]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-sm text-[#9CA3AF]">
                No users found matching your search.
              </div>
            )}
          </div>
        </>
      ) : (
        /* Roles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full py-20 flex justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#0B9DF7]" />
            </div>
          ) : (
            roles.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-[#33373D] bg-[#1E2024] p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-5 w-5 text-[#0B9DF7]" />
                    <h2 className="font-semibold text-base text-[#F3F4F6]">{r.name}</h2>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#26292F] text-[#9CA3AF] border border-[#33373D]">
                    {r.type}
                  </span>
                </div>
                {r.description && <p className="text-xs text-[#9CA3AF]">{r.description}</p>}
                <div>
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase">
                    Permissions ({r.permissions?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.permissions?.map((p, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-xs px-2 py-0.5 rounded bg-[#16181B] border border-[#33373D] text-[#0B9DF7]"
                      >
                        {p.permission?.key || 'all'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account?"
        description="Are you sure you want to remove this user account? If this user owns a website, that website will be archived and unlisted."
        itemName={deletingUser ? `${deletingUser.name} (${deletingUser.email})` : undefined}
        confirmLabel="Delete User"
        loading={deleteLoading}
      />

      {/* Create Owner Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-[#33373D] bg-[#1E2024] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-3.5">
              <div className="flex items-center gap-2.5">
                <UserPlus className="h-5 w-5 text-[#0B9DF7]" />
                <h3 className="text-lg font-bold text-[#F3F4F6] tracking-tight">
                  Create Website Owner Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-[#9CA3AF] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOwner} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Alexander Vance"
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                  Email Address * (Credentials will be sent here)
                </label>
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="alexander@domain.com"
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
                />
              </div>

              {/* Website Registration Toggle */}
              <div className="pt-2 border-t border-[#33373D] space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeWebsite}
                    onChange={(e) => setIncludeWebsite(e.target.checked)}
                    className="w-4 h-4 rounded border-[#33373D] bg-[#16181B] text-[#0B9DF7] focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-[#0B9DF7]" />
                    Register Website For This Owner Now
                  </span>
                </label>

                {includeWebsite && (
                  <div className="space-y-3 rounded-xl border border-[#33373D] bg-[#16181B] p-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                        Website Name *
                      </label>
                      <input
                        type="text"
                        required={includeWebsite}
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        placeholder="e.g. MangaHub Online"
                        className="w-full h-10 rounded-lg border border-[#33373D] bg-[#1E2024] px-3 text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                        Primary Mirror URL *
                      </label>
                      <input
                        type="text"
                        required={includeWebsite}
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                        placeholder="https://mangahub.online"
                        className="w-full h-10 rounded-lg border border-[#33373D] bg-[#1E2024] px-3 text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                        Category *
                      </label>
                      <select
                        required={includeWebsite}
                        value={siteCategoryId}
                        onChange={(e) => setSiteCategoryId(e.target.value)}
                        className="w-full h-10 rounded-lg border border-[#33373D] bg-[#1E2024] px-3 text-[#F3F4F6] text-xs focus:outline-none focus:border-[#0B9DF7]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                        Tagline (Optional)
                      </label>
                      <input
                        type="text"
                        value={siteTagline}
                        onChange={(e) => setSiteTagline(e.target.value)}
                        placeholder="Leading online manga discovery community..."
                        className="w-full h-10 rounded-lg border border-[#33373D] bg-[#1E2024] px-3 text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                        placeholder="Overview of website features and mirrors..."
                        className="w-full rounded-lg border border-[#33373D] bg-[#1E2024] p-2.5 text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] text-xs resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-[#33373D] bg-[#16181B] p-3 text-xs text-[#9CA3AF] leading-relaxed">
                💡 <strong>Credentials Email:</strong> A randomized temporary password will be
                created and an invitation email will be dispatched to{' '}
                <strong>{ownerEmail || 'the user'}</strong> containing direct panel login
                instructions.
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#33373D]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="h-11 px-5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-semibold text-[#D1D5DB] hover:bg-[#26292F] hover:text-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="h-11 px-5 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#0B9DF7]/20 disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Owner User</span>
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
