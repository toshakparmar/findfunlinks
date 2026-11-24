'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import {
  LayoutDashboard,
  ClipboardCheck,
  Globe,
  Radio,
  FolderKanban,
  Tag,
  Inbox,
  Mail,
  FileText,
  Users,
  History,
  Settings,
  KeyRound,
  ExternalLink,
  BarChart3,
  LifeBuoy,
  ArrowUpDown,
} from 'lucide-react';
import { BRAND } from '@finallinks/config';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [openQueriesCount, setOpenQueriesCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const currentRole = user?.role?.type;
    if (currentRole !== 'SUPER_ADMIN' && currentRole !== 'ADMIN') return;

    const fetchBadges = () => {
      api.admin
        .getPendingRegistrationsCount()
        .then((res) => {
          if (mounted && typeof res.count === 'number') {
            setPendingCount(res.count);
          }
        })
        .catch(() => {});

      api.admin
        .getReports({ limit: 1, status: 'PENDING' })
        .then((res) => {
          if (mounted && typeof res.total === 'number') {
            setOpenQueriesCount(res.total);
          }
        })
        .catch(() => {});
    };

    fetchBadges();
    const timer = setInterval(fetchBadges, 60000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [user?.role?.type]);

  const publicWebUrl = process.env.NEXT_PUBLIC_PUBLIC_WEB_URL || 'http://localhost:3000';

  const roleType = user?.role?.type;
  const isOwner = roleType === 'WEBSITE_OWNER' || roleType === 'OWNER';
  const isSuperAdmin = roleType === 'SUPER_ADMIN';

  let navSections = [];

  if (isOwner) {
    navSections = [
      {
        title: 'My Website',
        items: [
          { href: '/my-websites', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/my-websites/domains', label: 'Mirrors & Links', icon: Radio },
          { href: '/my-websites/edit', label: 'Website Profile', icon: Globe },
          { href: '/my-websites/analytics', label: 'Analytics', icon: BarChart3 },
          { href: '/my-websites/support', label: 'Support & Tickets', icon: LifeBuoy },
        ],
      },
      {
        title: 'Account & Security',
        items: [
          { href: '/change-password', label: 'Change Password', icon: KeyRound },
          { href: '/settings', label: 'Profile & Sessions', icon: Settings },
        ],
      },
    ];
  } else {
    // Admin & Super Admin
    navSections = [
      {
        title: 'Overview',
        items: [{ href: '/', label: 'Executive Dashboard', icon: LayoutDashboard }],
      },
      {
        title: 'Directory & Moderation',
        items: [
          { href: '/websites', label: 'Websites Directory', icon: Globe },
          {
            href: '/registrations',
            label: 'Owner Registrations',
            icon: ClipboardCheck,
            badge: pendingCount && pendingCount > 0 ? pendingCount : null,
          },
          { href: '/ranking', label: 'Website Ranking', icon: ArrowUpDown },
          { href: '/categories', label: 'Categories', icon: FolderKanban },
          { href: '/tags', label: 'Tags', icon: Tag },
          {
            href: '/inbox',
            label: 'Queries & Reports',
            icon: Inbox,
            badge: openQueriesCount && openQueriesCount > 0 ? openQueriesCount : null,
          },
        ],
      },
      {
        title: 'Content & Messaging',
        items: [
          { href: '/email-templates', label: 'Email Templates', icon: Mail },
          { href: '/pages', label: 'CMS Pages', icon: FileText },
        ],
      },
      {
        title: 'System Management',
        items: [
          ...(isSuperAdmin ? [{ href: '/users', label: 'Users & Roles', icon: Users }] : []),
          { href: '/audit-logs', label: 'Audit Logs', icon: History },
          ...(isSuperAdmin
            ? [{ href: '/settings', label: 'Platform Settings', icon: Settings }]
            : []),
        ],
      },
    ];
  }

  // Role display badge
  const roleBadge = isOwner
    ? { label: 'Owner', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' }
    : isSuperAdmin
      ? { label: 'Super Admin', color: 'bg-[#0B9DF7]/10 text-[#0B9DF7] border-[#0B9DF7]/30' }
      : { label: 'Moderator', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };

  return (
    <aside className="w-64 shrink-0 border-r border-[#33373D] bg-[#1E2024] flex flex-col justify-between h-full select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#33373D]">
          <Link
            href={isOwner ? '/my-websites' : '/'}
            className="flex items-center gap-2.5"
            onClick={onCloseMobile}
          >
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image
                src="/mark-blue.svg"
                alt={BRAND.name}
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#F3F4F6] block">
                {BRAND.name}
              </span>
              <span className="text-[11px] font-medium text-[#9CA3AF] block -mt-0.5">
                {isOwner ? 'Owner Console' : 'Admin Console'}
              </span>
            </div>
          </Link>

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadge.color}`}
          >
            {roleBadge.label}
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]/70 mb-1.5">
                {section.title}
              </p>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/' || item.href === '/my-websites'
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 h-11 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#26292F] text-white font-semibold shadow-sm'
                        : 'text-[#D1D5DB] hover:bg-[#26292F]/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 ${isActive ? 'text-[#0B9DF7]' : 'text-[#9CA3AF]'}`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#0B9DF7] text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Public Directory Link */}
      <div className="p-3 border-t border-[#33373D]">
        <a
          href={publicWebUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 h-11 rounded-lg text-xs font-medium text-[#9CA3AF] hover:bg-[#26292F] hover:text-[#F3F4F6] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#0B9DF7]" />
            <span>Open Public Directory</span>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-[#6B7280]" />
        </a>
      </div>
    </aside>
  );
}
