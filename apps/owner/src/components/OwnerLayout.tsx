'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { OwnerSidebar } from './OwnerSidebar';
import { OwnerTopbar } from './OwnerTopbar';
import { useAuth } from '../lib/auth-context';
import { api, type OwnerWebsiteDetails } from '../lib/api';
import { Loader2 } from 'lucide-react';

const AUTH_PATHS = ['/login', '/accept-invite', '/change-password'];

export function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [website, setWebsite] = useState<OwnerWebsiteDetails | null>(null);

  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (user && !isAuthPage) {
      api.owner
        .getWebsite()
        .then((res) => setWebsite(res))
        .catch(() => setWebsite(null));
    }
  }, [user, isAuthPage]);

  if (isAuthPage) {
    return <main className="min-h-screen bg-[#050A18] text-[#F1F5F9]">{children}</main>;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050A18] text-[#F1F5F9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
          <p className="text-xs text-[#A8B3C7]">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050A18] text-[#F1F5F9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
          <p className="text-xs text-[#A8B3C7]">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#050A18] text-[#F1F5F9]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <OwnerSidebar publicSlug={website?.slug} />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-[#070D1E] shadow-2xl border-r border-[#1A2442]">
            <OwnerSidebar onCloseMobile={() => setMobileOpen(false)} publicSlug={website?.slug} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerTopbar
          onOpenMobile={() => setMobileOpen(true)}
          websiteName={website?.name}
          websiteStatus={website?.status}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
