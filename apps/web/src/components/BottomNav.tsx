'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Flame, MessageSquare } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Categories', href: '/categories', icon: LayoutGrid },
    { label: 'Popular', href: '/popular', icon: Flame },
    { label: 'Requests', href: '/requests', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[var(--header,#070D1E)]/95 backdrop-blur-md border-t border-[var(--line,#1A2442)] px-2 py-1.5 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all duration-150 ${
              isActive
                ? 'bg-[var(--primary,#2563EB)] text-white px-4 py-1 rounded-[12px] shadow-sm'
                : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white px-2 py-1'
            }`}
          >
            <IconComponent className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
