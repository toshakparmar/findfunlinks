'use client';

import React from 'react';
import { useAuth } from '../lib/auth-context';
import { LogOut, Menu, Shield } from 'lucide-react';
import { BRAND } from '@finallinks/config';

interface AdminTopbarProps {
  onOpenMobile?: () => void;
}

export function AdminTopbar({ onOpenMobile }: AdminTopbarProps) {
  const { user, logout } = useAuth();

  const roleType = user?.role?.type;
  const isOwner = roleType === 'WEBSITE_OWNER' || roleType === 'OWNER';
  const isSuperAdmin = roleType === 'SUPER_ADMIN';

  const consoleTitle = isOwner
    ? `${BRAND.name} Owner Console`
    : isSuperAdmin
      ? `${BRAND.name} Super Admin Console`
      : `${BRAND.name} Moderator Console`;

  return (
    <header className="h-16 border-b border-[#33373D] bg-[#1E2024] px-5 sm:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <button
            type="button"
            onClick={onOpenMobile}
            className="md:hidden p-2 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#26292F] transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOwner ? 'bg-[#10B981]' : isSuperAdmin ? 'bg-[#8B5CF6]' : 'bg-[#0B9DF7]'
            }`}
          />
          <h1 className="text-base font-semibold text-[#F3F4F6]">{consoleTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg border flex items-center justify-center font-bold ${
                  isOwner
                    ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                    : isSuperAdmin
                      ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30'
                      : 'bg-[#0B9DF7]/15 text-[#0B9DF7] border-[#0B9DF7]/30'
                }`}
              >
                <Shield className="h-4 w-4" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-[#F3F4F6] truncate max-w-[160px]">
                  {user.name}
                </div>
                <div className="text-xs text-[#9CA3AF] truncate max-w-[160px] font-mono">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#9CA3AF] hover:bg-[#26292F] hover:text-[#F3F4F6] transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
