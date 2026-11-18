'use client';

import React from 'react';
import {
  Tv,
  Download,
  BookOpen,
  Music,
  PlayCircle,
  Calendar,
  Gamepad2,
  Palette,
  Terminal,
  Wrench,
  Compass,
} from 'lucide-react';
import { CategoryMeta } from '../lib/directory-data';

interface QuickCategoryGridProps {
  categories: CategoryMeta[];
  onSelectCategory: (slug: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Tv,
  Download,
  BookOpen,
  Music,
  PlayCircle,
  Calendar,
  Gamepad2,
  Palette,
  Terminal,
  Wrench,
};

export function QuickCategoryGrid({ categories, onSelectCategory }: QuickCategoryGridProps) {
  const handleClick = (slug: string) => {
    onSelectCategory(slug);
    const target = document.getElementById(`category-${slug}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-10 gap-2 my-4">
      {categories.map((cat) => {
        const IconComponent = (cat.iconName && CATEGORY_ICONS[cat.iconName]) || Compass;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleClick(cat.slug)}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-[#15151a] hover:bg-[#1f1f26] border border-[#26262e] hover:border-neutral-700 transition-all group active:scale-95 text-center"
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110"
              style={{
                backgroundColor: `${cat.themeColor || '#3b82f6'}18`,
                color: cat.themeColor || '#60a5fa',
              }}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-neutral-300 group-hover:text-white truncate max-w-full">
              {cat.name.split(' ')[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
