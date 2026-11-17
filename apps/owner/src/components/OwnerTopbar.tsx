'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { StatusBadge } from './StatusBadge';

interface OwnerTopbarProps {
  onOpenMobile: () => void;
  websiteName?: string;
  websiteStatus?: string;
}

export function OwnerTopbar({ onOpenMobile, websiteName, websiteStatus }: OwnerTopbarProps) {
  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {websiteName && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-neutral-900 dark:text-white">
              {websiteName}
            </span>
            {websiteStatus && <StatusBadge status={websiteStatus} />}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
