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
} from 'lucide-react';
import { getActive } from '../lib/nav';
import { CLIENT_18_CATEGORIES } from '../lib/client-catalog';

export interface CategoryChipItem {
  slug: string;
  name: string;
  iconName?: string | null;
  themeColor?: string | null;
}

export interface CategoryChipsProps {
  categories?: CategoryChipItem[];
  activeCategorySlug?: string | null;
  onSelectCategory?: (slug: string | null) => void;
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

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  className = '',
}) => {
  const pathname = usePathname();
  const { sidebar: activeSlug } = getActive(pathname || '/');

  const chipList: CategoryChipItem[] =
    categories && categories.length > 0
      ? categories
      : CLIENT_18_CATEGORIES.map((c) => ({
          slug: c.slug,
          name: c.name,
          iconName: c.iconName,
          themeColor: c.themeColor,
        }));

  const isAllActive = activeSlug === 'all';

  return (
    <div
      className={`lg:hidden w-full overflow-x-auto no-scrollbar py-2.5 px-3 flex items-center gap-2 select-none snap-x snap-mandatory ${className}`}
    >
      {/* "All Links" Primary Tile */}
      <Link
        href="/"
        aria-current={isAllActive ? 'page' : undefined}
        className={`snap-start shrink-0 min-w-[70px] h-[64px] px-2.5 py-1.5 rounded-[12px] flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
          isAllActive
            ? 'bg-[var(--primary,#2563EB)] text-white shadow-md'
            : 'bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] text-[var(--text-2,#A8B3C7)] hover:text-white'
        }`}
      >
        <LayoutGrid className="w-5 h-5 shrink-0" />
        <span className="text-[11px] font-semibold truncate leading-none">
          All Links
        </span>
      </Link>

      {/* Category Tiles */}
      {chipList.map((cat) => {
        const isActive = activeSlug === cat.slug;
        const IconComp = (cat.iconName && ICON_MAP[cat.iconName]) || LayoutGrid;
        const iconColor = cat.themeColor || 'var(--primary,#2563EB)';

        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            aria-current={isActive ? 'page' : undefined}
            className={`snap-start shrink-0 min-w-[70px] h-[64px] px-2.5 py-1.5 rounded-[12px] flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isActive
                ? 'bg-[var(--primary,#2563EB)] text-white shadow-md'
                : 'bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] text-[var(--text-2,#A8B3C7)] hover:text-white'
            }`}
          >
            <IconComp
              className="w-5 h-5 shrink-0"
              style={{ color: isActive ? '#FFFFFF' : iconColor }}
            />
            <span className="text-[11px] font-medium truncate leading-none">
              {cat.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
