'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@findfunlinks/ui';
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
} from 'lucide-react';

export function AdminSidebar() {
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

  return (
    <aside className="w-64 shrink-0 border-r border-border/80 bg-card flex flex-col justify-between hidden md:flex h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-border/60">
          <Logo variant="auto" className="h-7 w-auto" />
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider border border-primary/20">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-primary/15 text-primary'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/60 text-[11px] text-muted-foreground/70">
        FindFunLinks Super Admin v0.1.0
      </div>
    </aside>
  );
}

