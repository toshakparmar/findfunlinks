'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Users, Shield, ShieldCheck, Search, RefreshCw, Lock, Unlock, Loader2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

  useEffect(() => {
    if (activeTab === 'USERS') {
      fetchUsers();
    } else {
      fetchRoles();
    }
  }, [activeTab, fetchUsers, fetchRoles]);

  const handleToggleStatus = async (user: UserRecord) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoadingId(user.id);
    try {
      await api.admin.setUserStatus(user.id, newStatus);
      toast.success(`User marked as ${newStatus.toLowerCase()}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus as any } : u)),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user status';
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">
            Users & Access Control
          </h1>
          <p className="text-xs text-[#A8B3C7] mt-1">
            Manage Super Admin and Website Owner platform credentials, RBAC roles, and login access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => (activeTab === 'USERS' ? fetchUsers() : fetchRoles())}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1A2442] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'USERS'
              ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25'
              : 'border border-[#1A2442] bg-[#0A1226] text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]'
          }`}
        >
          <Users className="h-4 w-4" />
          Users Directory
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ROLES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ROLES'
              ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25'
              : 'border border-[#1A2442] bg-[#0A1226] text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]'
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
            <Search className="h-4 w-4 text-[#6B7893] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] pl-9 pr-3.5 py-2 text-xs text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
            />
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-[#1A2442] bg-[#0A1226] shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
              </div>
            ) : users.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1A2442] bg-[#070D1E] text-[#A8B3C7]">
                        <th className="py-3 px-4 font-semibold">User</th>
                        <th className="py-3 px-4 font-semibold">Role</th>
                        <th className="py-3 px-4 font-semibold">Managed Website</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Joined</th>
                        <th className="py-3 px-4 font-semibold text-right">Access Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A2442]/60">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#0E182F] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#F1F5F9]">{u.name}</div>
                            <div className="text-[11px] font-mono text-[#A8B3C7]">{u.email}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                u.role?.type === 'SUPER_ADMIN'
                                  ? 'bg-[#2563EB]/15 text-[#3B82F6] border-[#2563EB]/30'
                                  : 'bg-[#1A2442] text-[#A8B3C7] border-[#1A2442]'
                              }`}
                            >
                              <Shield className="h-3 w-3" />
                              {u.role?.name || 'Owner'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-[#A8B3C7]">
                            {u.website ? (
                              <span className="font-semibold text-[#F1F5F9]">{u.website.name}</span>
                            ) : (
                              <span className="text-[#6B7893]">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <StatusBadge status={u.status} />
                          </td>

                          <td className="py-3.5 px-4 text-[#A8B3C7]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {u.role?.type !== 'SUPER_ADMIN' && (
                              <button
                                type="button"
                                disabled={actionLoadingId === u.id}
                                onClick={() => handleToggleStatus(u)}
                                className={`p-1.5 rounded-lg border transition-colors inline-flex items-center gap-1 text-xs font-semibold ${
                                  u.status === 'ACTIVE'
                                    ? 'border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444] hover:text-white'
                                    : 'border-[#22C55E]/30 bg-[#22C55E]/15 text-[#22C55E] hover:bg-[#22C55E] hover:text-white'
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
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-[#1A2442] bg-[#070D1E] text-xs text-[#A8B3C7]">
                    <span>
                      Page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded-lg border border-[#1A2442] bg-[#0A1226] text-[#F1F5F9] disabled:opacity-40 hover:bg-[#0E182F]"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-2.5 py-1 rounded-lg border border-[#1A2442] bg-[#0A1226] text-[#F1F5F9] disabled:opacity-40 hover:bg-[#0E182F]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-xs text-[#A8B3C7]">
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
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
            </div>
          ) : (
            roles.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-[#1A2442] bg-[#0A1226] p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#3B82F6]" />
                    <h2 className="font-bold text-sm text-[#F1F5F9]">{r.name}</h2>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1A2442] text-[#A8B3C7]">
                    {r.type}
                  </span>
                </div>
                {r.description && <p className="text-xs text-[#A8B3C7]">{r.description}</p>}
                <div>
                  <span className="text-[11px] font-semibold text-[#A8B3C7] uppercase">
                    Permissions ({r.permissions?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.permissions?.map((p, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#070D1E] border border-[#1A2442] text-[#3B82F6]"
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
    </div>
  );
}
