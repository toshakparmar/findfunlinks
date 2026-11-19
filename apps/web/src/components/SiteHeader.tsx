'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  Zap,
  Flame,
  MessageSquare,
  Search,
  Menu,
  Sun,
  Moon,
  PlusCircle,
} from 'lucide-react';
import { Logo } from '@findfunlinks/ui';
import { getActive, ActiveHeaderTab } from '../lib/nav';

export interface SiteHeaderProps {
  onOpenSearch?: () => void;
  onOpenMobileMenu?: () => void;
  currentTheme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  showThemeToggle?: boolean;
}

interface NavItem {
  key: ActiveHeaderTab;
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home', href: '/', icon: Home },
  { key: 'categories', label: 'Categories', href: '/categories', icon: LayoutGrid },
  { key: 'new', label: 'New', href: '/new', icon: Zap },
  { key: 'popular', label: 'Popular', href: '/popular', icon: Flame },
  { key: 'requests', label: 'Requests', href: '/requests', icon: MessageSquare },
];

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  onOpenSearch,
  onOpenMobileMenu,
  currentTheme = 'dark',
  onToggleTheme,
  showThemeToggle = true,
}) => {
  const pathname = usePathname();
  const { header: activeTab } = getActive(pathname || '/');

  return (
    <header className="sticky top-0 z-40 w-full h-14 md:h-16 bg-[var(--header,#070D1E)] border-b border-[var(--line,#1A2442)] px-4 lg:px-6 flex items-center justify-between transition-colors">
      {/* Left: Brand Logo & Desktop Navigation */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group select-none">
          <Logo variant="auto" className="h-8 md:h-9 w-auto" />
        </Link>

        {/* Desktop Nav Pills */}
        <nav className="hidden lg:flex items-center gap-1.5 ml-2">
          {NAV_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.key;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] text-xs font-semibold transition-all duration-150 select-none ${
                  isActive
                    ? 'bg-[var(--primary,#2563EB)] text-white shadow-sm'
                    : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white hover:bg-[var(--card-hover,#0E182F)]'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Controls: List Website CTA, Search, Theme Toggle, Mobile Menu */}
      <div className="flex items-center gap-2">
        {/* Registration CTA Button */}
        <Link
          href="/register"
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).va) {
              (window as any).va('event', { name: 'cta_register_click', data: { source: 'header' } });
            }
          }}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-semibold bg-[var(--primary,#2563EB)] hover:bg-[var(--primary-hover,#1D4ED8)] text-white shadow-sm transition-all duration-150 cursor-pointer select-none mr-1"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">List Your Website</span>
          <span className="xl:hidden">List Site</span>
        </Link>

        {/* Round Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search websites, categories, or domains"
          className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[var(--card,#0A1226)] border border-[var(--primary,#2563EB)]/40 hover:border-[var(--primary,#2563EB)] flex items-center justify-center text-slate-900 dark:text-white transition-all shadow-[0_0_12px_-2px_rgba(37,99,235,0.35)] hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Search className="w-4 h-4 text-[var(--primary,#2563EB)]" />
        </button>

        {/* Optional Theme Toggle Button */}
        {showThemeToggle && onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
            className="hidden md:flex w-9 h-9 md:w-10 md:h-10 rounded-full bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] hover:border-[var(--text-2,#A8B3C7)] items-center justify-center text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Mobile Hamburger Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open mobile navigation menu"
          className="lg:hidden w-9 h-9 rounded-full bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] flex items-center justify-center text-slate-900 dark:text-white hover:bg-[var(--card-hover,#0E182F)] transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
