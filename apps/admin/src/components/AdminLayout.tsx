'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { useAuth } from '../lib/auth-context';
import { CircularLoader } from '@finallinks/ui';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isStandalonePage =
    ['/login', '/accept-invite'].some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    (pathname === '/change-password' && user?.mustChangePassword);

  if (isStandalonePage) {
    return <main className="min-h-screen bg-[#16181B] text-[#F3F4F6]">{children}</main>;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#16181B] text-[#F3F4F6]">
        <CircularLoader size="xl" label="Loading" color="#0B9DF7" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#16181B] text-[#F3F4F6]">
        <CircularLoader size="xl" label="Loading" color="#0B9DF7" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#16181B] text-[#F3F4F6] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-[#1E2024] shadow-2xl border-r border-[#33373D]">
            <AdminSidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area - Full width with clean padding */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 p-5 sm:p-6 lg:p-8 w-full max-w-[1720px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
