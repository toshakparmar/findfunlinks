'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { useAuth } from '../lib/auth-context';
import { Loader2 } from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const { user, loading: authLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoginPage) {
    return <main className="min-h-screen bg-[#050A18] text-[#F1F5F9]">{children}</main>;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050A18] text-[#F1F5F9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
          <p className="text-xs text-[#A8B3C7]">Loading Super Admin Console...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050A18] text-[#F1F5F9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
          <p className="text-xs text-[#A8B3C7]">Redirecting to admin login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A18] text-[#F1F5F9] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block sticky top-0 h-screen">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-[#070D1E] shadow-2xl border-r border-[#1A2442]">
            <AdminSidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
