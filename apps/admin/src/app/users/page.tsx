'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Users,
  Shield,
  ShieldCheck,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  Key,
  Mail,
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
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoadingId(user.id);
    try {
      await api.admin.setUserStatus(user.id, nextStatus);
      toast.success(`User status updated to ${nextStatus.toLowerCase()}`);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            User Accounts & RBAC
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage administrative operators, registered website owners, and view system role
            privileges.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('USERS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'USERS'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('ROLES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'ROLES'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Roles & Permissions
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'USERS' ? (
        <>
          {/* Search bar */}
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-xs uppercase text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">User</th>
                    <th className="py-3 px-4 font-semibold">Role</th>
                    <th className="py-3 px-4 font-semibold">Associated Website</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Last Login</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-400">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs uppercase">
                              {user.name ? user.name[0] : 'U'}
                            </div>
                            <div>
                              <span className="font-semibold text-neutral-900 dark:text-white block text-sm">
                                {user.name}
                              </span>
                              <span className="text-xs text-neutral-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role?.type === 'SUPER_ADMIN'
                                ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            {user.role?.name || 'User'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {user.website ? (
                            <span className="text-xs font-medium text-neutral-900 dark:text-white">
                              {user.website.name}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="py-3 px-4 text-xs text-neutral-400 whitespace-nowrap">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {user.role?.type !== 'SUPER_ADMIN' && (
                            <button
                              disabled={actionLoadingId === user.id}
                              onClick={() => handleToggleStatus(user)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                user.status === 'ACTIVE'
                                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50'
                                  : 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-900/50'
                              }`}
                            >
                              {user.status === 'ACTIVE' ? (
                                <>
                                  <Lock className="w-3 h-3" /> Suspend
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3" /> Activate
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Roles & Permissions Breakdown */
        <div className="space-y-6">
          {loading ? (
            <div className="py-12 text-center text-neutral-400 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
              Loading roles & permissions...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 dark:text-white">{role.name}</h3>
                        <span className="text-xs text-neutral-400">
                          Type: {role.type} • {role.permissions.length} permissions
                        </span>
                      </div>
                    </div>
                  </div>

                  {role.description && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {role.description}
                    </p>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                      Assigned Capabilities
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      {role.permissions.map((rp) => (
                        <span
                          key={rp.permission.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                        >
                          <Key className="w-2.5 h-2.5 text-blue-500" />
                          {rp.permission.key}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
