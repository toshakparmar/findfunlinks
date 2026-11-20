'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { api } from '../lib/api';
import {
  LayoutDashboard,
  ClipboardCheck,
  Globe,
  Radio,
  FolderKanban,
  Tag,
  Flag,
  Users,
  History,
  Settings,
  Shield,
  ExternalLink,
} from 'lucide-react';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    api.admin
      .getPendingRegistrationsCount()
      .then((res) => {
        if (mounted && typeof res.count === 'number') {
          setPendingCount(res.count);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [pathname]);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    {
      href: '/registrations',
      label: 'Owner Requests',
      icon: ClipboardCheck,
      badge: pendingCount && pendingCount > 0 ? pendingCount : null,
    },
    { href: '/websites', label: 'Websites Directory', icon: Globe },
    { href: '/domains', label: 'Domains & Mirrors', icon: Radio },
    { href: '/categories', label: 'Categories', icon: FolderKanban },
    { href: '/tags', label: 'Tags', icon: Tag },
    { href: '/reports', label: 'Reports & Issues', icon: Flag },
    { href: '/users', label: 'Users & Roles', icon: Users },
    { href: '/audit-logs', label: 'Audit Logs', icon: History },
    { href: '/settings', label: 'Platform Settings', icon: Settings },
  ];

  const publicWebUrl = process.env.NEXT_PUBLIC_PUBLIC_WEB_URL || 'http://localhost:3000';

  return (
    <aside className="w-64 shrink-0 border-r border-[#1A2442] bg-[#070D1E] flex flex-col justify-between h-full select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1A2442]">
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
                Admin Console
              </span>
            </div>
          </Link>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2563EB]/15 text-[#3B82F6] uppercase tracking-wider border border-[#2563EB]/30">
            <Shield className="h-2.5 w-2.5" />
            Super
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B7893]">
            Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/30'
                    : 'text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#6B7893]'}`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#2563EB]/20 text-[#3B82F6] border border-[#2563EB]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B7893]">
            Directory View
          </div>
          <a
            href={publicWebUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-all group"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="h-4 w-4 text-[#3B82F6]" />
              <span>Open Public Site</span>
            </div>
            <span className="text-[10px] text-[#6B7893] group-hover:text-[#A8B3C7]">↗</span>
          </a>
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#1A2442] text-[11px] text-[#6B7893] flex items-center justify-between">
        <span>FindFunLinks v0.1.0</span>
        <span className="w-2 h-2 rounded-full bg-[#22C55E]" title="API Connected" />
      </div>
    </aside>
  );
}
