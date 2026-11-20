'use client';

import React from 'react';
import { Menu, Globe } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface OwnerTopbarProps {
  onOpenMobile: () => void;
  websiteName?: string;
  websiteStatus?: string;
}

export function OwnerTopbar({ onOpenMobile, websiteName, websiteStatus }: OwnerTopbarProps) {
  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[#1A2442] bg-[#070D1E]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-[#A8B3C7] hover:text-[#F1F5F9] hover:bg-[#0E182F] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {websiteName ? (
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#2563EB]/15 text-[#3B82F6] border border-[#2563EB]/30 hidden sm:flex">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-[#F1F5F9]">{websiteName}</span>
            {websiteStatus && <StatusBadge status={websiteStatus} />}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
            <span className="font-bold text-sm text-[#F1F5F9]">Website Owner Portal</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-[#1A2442] bg-[#0A1226] text-[11px] text-[#A8B3C7]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          <span>Operational</span>
        </div>
      </div>
    </header>
  );
}
