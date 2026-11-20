'use client';

import React from 'react';
import { useAuth } from '../lib/auth-context';
import { LogOut, Menu, Shield } from 'lucide-react';

interface AdminTopbarProps {
  onOpenMobile?: () => void;
}

export function AdminTopbar({ onOpenMobile }: AdminTopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-[#1A2442] bg-[#070D1E]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <button
            type="button"
            onClick={onOpenMobile}
            className="md:hidden p-2 rounded-xl text-[#A8B3C7] hover:text-[#F1F5F9] hover:bg-[#0E182F] transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse hidden sm:inline-block" />
          <h1 className="text-sm font-bold text-[#F1F5F9]">Super Admin Console</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-3 pl-3">
            <div className="flex items-center gap-2.5 text-xs">
              <div className="h-8 w-8 rounded-full bg-[#2563EB]/15 text-[#3B82F6] border border-[#2563EB]/30 flex items-center justify-center font-bold">
                <Shield className="h-4 w-4" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-[#F1F5F9] truncate max-w-[140px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-[#A8B3C7] truncate max-w-[140px]">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
