'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { LayoutDashboard, Globe, Sliders, Settings, LogOut, ExternalLink } from 'lucide-react';

interface OwnerSidebarProps {
  onCloseMobile?: () => void;
  publicSlug?: string;
}

export function OwnerSidebar({ onCloseMobile, publicSlug }: OwnerSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Mirrors & Domains', href: '/domains', icon: Globe },
    { label: 'Website Profile', href: '/website', icon: Sliders },
    { label: 'Security & Account', href: '/settings', icon: Settings },
  ];

  const publicWebUrl = process.env.NEXT_PUBLIC_PUBLIC_WEB_URL || 'http://localhost:3000';

  return (
    <aside className="w-64 h-full flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src="/logo-mark.svg"
              alt="FindFunLinks"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white block">
              FindFunLinks
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block -mt-1">
              Owner Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Public Directory Quick Link */}
        <div className="pt-4 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Directory
        </div>
        <a
          href={publicSlug ? `${publicWebUrl}/website/${publicSlug}` : publicWebUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Public Listing</span>
          </div>
          <span className="text-[10px] text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
            Open ↗
          </span>
        </a>
      </div>

      {/* Owner User Footer */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs uppercase">
            {user?.name ? user.name[0] : 'O'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-xs text-neutral-900 dark:text-white block truncate">
              {user?.name || 'Website Owner'}
            </span>
            <span className="text-[11px] text-neutral-400 block truncate">{user?.email}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
