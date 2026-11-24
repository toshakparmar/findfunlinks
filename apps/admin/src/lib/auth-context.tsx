'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from './api';
import type { UserProfile } from '@finallinks/contracts';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
  refreshProfile: async () => {},
  setUser: () => {},
});

const PUBLIC_PATHS = ['/login', '/accept-invite', '/change-password'];

// Admin paths that are prohibited for OWNER role
const ADMIN_ONLY_PATHS = [
  '/websites',
  '/registrations',
  '/categories',
  '/domains',
  '/tags',
  '/reports',
  '/audit-logs',
];

// Super Admin only paths
const SUPER_ADMIN_ONLY_PATHS = ['/users', '/settings'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const profile = await api.auth.me();
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    async function initAuth() {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, [refreshUser]);

  // Route protection & RBAC guards
  useEffect(() => {
    if (loading) return;

    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

    if (!user && !isPublic) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user) {
      const roleType = user.role?.type;
      const isOwner = roleType === 'WEBSITE_OWNER' || roleType === 'OWNER';

      // Force change password if required
      if (user.mustChangePassword && pathname !== '/change-password') {
        toast.info('Please set a new permanent password to continue.');
        router.replace('/change-password');
        return;
      }

      // If user is on /login, redirect to default landing page
      if (pathname === '/login') {
        if (user.mustChangePassword) {
          router.replace('/change-password');
        } else if (isOwner) {
          router.replace('/my-websites');
        } else {
          router.replace('/');
        }
        return;
      }

      // Root landing page redirect
      if (pathname === '/') {
        if (isOwner) {
          router.replace('/my-websites');
          return;
        }
        // Super Admin / Admin stays on Executive Dashboard ('/')
      }

      // OWNER role restrictions
      if (isOwner) {
        const isTryingAdmin =
          ADMIN_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
          pathname === '/users' ||
          pathname.startsWith('/users/');

        if (isTryingAdmin) {
          toast.error('Access denied: Owner accounts cannot access the administrative console.');
          router.replace('/my-websites');
          return;
        }
      }

      // ADMIN role restrictions (cannot access Super Admin only settings/users)
      if (roleType === 'ADMIN') {
        const isTryingSuperAdmin = SUPER_ADMIN_ONLY_PATHS.some(
          (p) => pathname === p || pathname.startsWith(p + '/'),
        );
        if (isTryingSuperAdmin) {
          toast.error('Access denied: Super Admin privileges required.');
          router.replace('/websites');
          return;
        }
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.auth.login({ email, password });
      setUser(res.user);
      toast.success(`Welcome back, ${res.user.name}!`);

      const roleType = res.user.role?.type;
      const isOwner = roleType === 'WEBSITE_OWNER' || roleType === 'OWNER';
      if (res.user.mustChangePassword) {
        router.replace('/change-password');
      } else if (isOwner) {
        router.replace('/my-websites');
      } else {
        router.replace('/');
      }
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid login credentials.';
      toast.error(message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      router.replace('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        refreshProfile: refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
