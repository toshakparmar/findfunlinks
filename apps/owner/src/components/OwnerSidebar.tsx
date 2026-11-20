'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import {
  LayoutDashboard,
  Globe,
  Sliders,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

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
    <aside className="w-64 h-full flex flex-col bg-[#070D1E] border-r border-[#1A2442] select-none justify-between">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#1A2442]">
          <Link href="/" className="flex items-center gap-2.5" onClick={onCloseMobile}>
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
              <span className="font-bold text-sm tracking-tight text-[#F1F5F9] block">
                FindFunLinks
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#3B82F6] block -mt-1">
                Owner Portal
              </span>
            </div>
          </Link>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/15 text-[#22C55E] uppercase tracking-wider border border-[#22C55E]/30">
            <ShieldCheck className="h-2.5 w-2.5" />
            Verified
          </span>
        </div>

        {/* Navigation */}
        <div className="px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7893]">
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
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25'
                    : 'text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B7893]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Public Directory Quick Link */}
          <div className="pt-4 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7893]">
            Directory View
          </div>
          <a
            href={publicSlug ? `${publicWebUrl}/website/${publicSlug}` : publicWebUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-all group"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-[#3B82F6]" />
              <span>Public Listing</span>
            </div>
            <span className="text-[10px] text-[#6B7893] group-hover:text-[#A8B3C7]">Open ↗</span>
          </a>
        </div>
      </div>

      {/* Owner User Footer */}
      <div className="p-3 border-t border-[#1A2442] space-y-2">
        {user && (
          <div className="px-3 py-2 rounded-xl bg-[#0A1226] border border-[#1A2442] flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#F1F5F9] truncate">{user.name}</p>
              <p className="text-[10px] text-[#A8B3C7] truncate font-mono">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-[#6B7893] hover:text-[#EF4444] hover:bg-[#EF4444]/15 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="px-3 text-[10px] text-[#6B7893] text-center">
          FindFunLinks Owner Suite v0.1.0
        </div>
      </div>
    </aside>
  );
}
