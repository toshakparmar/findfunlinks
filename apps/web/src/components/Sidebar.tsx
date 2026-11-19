'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Film,
  Tv,
  PlaySquare,
  Smile,
  Trophy,
  Radio,
  Music,
  Gamepad2,
  Monitor,
  Wrench,
  Clapperboard,
  GraduationCap,
  BookOpen,
  Sparkles,
  Mic,
  Drama,
  Theater,
  Baby,
  MoreHorizontal,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { getActive } from '../lib/nav';
import { CLIENT_18_CATEGORIES } from '../lib/client-catalog';

export interface SidebarCategoryItem {
  id?: string;
  slug: string;
  name: string;
  iconName?: string | null;
}

export interface SidebarProps {
  categories?: SidebarCategoryItem[] | any[];
  activeCategorySlug?: string | null;
  onSelectCategory?: (slug: string | null) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  viewMode?: 'cards' | 'simple';
  onToggleViewMode?: (v: 'cards' | 'simple') => void;
  onOpenReportModal?: () => void;
  className?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Film,
  Tv,
  PlaySquare,
  Smile,
  Trophy,
  Radio,
  Music,
  Gamepad2,
  Monitor,
  Wrench,
  Clapperboard,
  GraduationCap,
  BookOpen,
  Sparkles,
  Mic,
  Drama,
  Theater,
  Baby,
  MoreHorizontal,
  LayoutGrid,
};

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  className = '',
}) => {
  const pathname = usePathname();
  const { sidebar: activeSidebarSlug } = getActive(pathname || '/');

  // Use all 18 categories with distinct icons
  const listCategories: SidebarCategoryItem[] =
    categories && categories.length > 0
      ? categories
      : CLIENT_18_CATEGORIES.map((c) => ({
          slug: c.slug,
          name: c.name,
          iconName: c.iconName,
        }));

  const isAllActive = activeSidebarSlug === 'all';

  return (
    <aside
      data-testid="category-sidebar"
      aria-label="Category navigation sidebar"
      className={`hidden lg:flex flex-col w-52 xl:w-56 shrink-0 bg-[var(--sidebar,#070D1E)] border-r border-[var(--line,#1A2442)] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-3 justify-between select-none ${className}`}
    >
      <div className="space-y-1">
        {/* "All Links" Primary Filter Pill */}
        <Link
          href="/"
          aria-current={isAllActive ? 'page' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${
            isAllActive
              ? 'bg-[var(--primary,#2563EB)] text-white shadow-sm'
              : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white hover:bg-[var(--card-hover,#0E182F)]'
          }`}
        >
          <LayoutGrid className="w-4 h-4 shrink-0" />
          <span className="truncate">All Links</span>
        </Link>

        {/* Pinned Category Links (All 18 categories) */}
        <div className="space-y-0.5 pt-1">
          {listCategories.map((cat) => {
            const isActive = activeSidebarSlug === cat.slug;
            const IconComp = (cat.iconName && ICON_MAP[cat.iconName]) || LayoutGrid;

            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-[10px] text-xs font-medium text-left transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[var(--primary,#2563EB)] text-white font-semibold shadow-sm'
                    : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white hover:bg-[var(--card-hover,#0E182F)]'
                }`}
              >
                <IconComp className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sidebar Bottom: CTA Promo Card */}
      <div className="pt-4 pb-1">
        <Link
          href="/register"
          className="group block p-3 rounded-[12px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] hover:border-[var(--primary,#2563EB)]/50 transition-all duration-200"
        >
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white text-xs font-semibold mb-1">
            <PlusCircle className="w-3.5 h-3.5 text-[var(--primary,#2563EB)]" />
            <span>Own a website?</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-2,#A8B3C7)] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            <span className="font-medium text-[var(--brand-link,#3B82F6)]">Get listed</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>
    </aside>
  );
};
