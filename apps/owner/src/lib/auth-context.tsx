'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, type UserProfile } from './api';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
  refreshProfile: async () => {},
});

const PUBLIC_PATHS = ['/login', '/accept-invite', '/change-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await api.auth.getMe();
      setUser(profile);
      return;
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    async function initAuth() {
      try {
        await refreshProfile();
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, [refreshProfile]);

  useEffect(() => {
    if (loading) return;

    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!user && !isPublic) {
      router.replace('/login');
    } else if (user && pathname === '/login') {
      if (user.mustChangePassword) {
        router.replace('/change-password');
      } else {
        router.replace('/');
      }
    } else if (user && user.mustChangePassword && pathname !== '/change-password') {
      router.replace('/change-password');
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.auth.login({ email, password });
      setUser(res.user);
      toast.success(`Welcome back, ${res.user.name}!`);
      if (res.user.mustChangePassword) {
        router.push('/change-password');
      } else {
        router.push('/');
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
      // ignore
    } finally {
      setUser(null);
      router.replace('/login');
      toast.info('Logged out successfully.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
