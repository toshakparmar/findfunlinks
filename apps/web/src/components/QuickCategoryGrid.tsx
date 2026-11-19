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
  Users,
  Compass,
} from 'lucide-react';
import { CategoryMeta } from '../lib/directory-data';
import { SpotlightCard } from './reactbits/SpotlightCard';

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
  Users,
};

export function QuickCategoryGrid({ categories, onSelectCategory }: QuickCategoryGridProps) {
  const handleClick = (slug: string) => {
    onSelectCategory(slug);
    const target = document.getElementById(`category-${slug}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Temporary highlight flash
      target.classList.add('ring-2', 'ring-primary');
      setTimeout(() => target.classList.remove('ring-2', 'ring-primary'), 1200);
    }
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-10 gap-2.5 my-5">
      {categories.map((cat) => {
        const IconComponent = (cat.iconName && CATEGORY_ICONS[cat.iconName]) || Compass;
        const themeColor = cat.themeColor || 'var(--primary)';

        return (
          <SpotlightCard
            key={cat.id}
            spotlightColor={`${themeColor}22`}
            className="p-0 border-token/10 bg-surface-1 hover:border-token/25 transition-all group"
          >
            <button
              type="button"
              onClick={() => handleClick(cat.slug)}
              className="w-full flex flex-col items-center justify-center p-3 text-center active:scale-95 transition-transform"
            >
              {/* Icon Chip in section accent */}
              <div
                className="w-9 h-9 rounded-chip flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 shadow-subtle"
                style={{
                  backgroundColor: `${themeColor}15`,
                  color: themeColor,
                }}
              >
                <IconComponent className="w-4 h-4" />
              </div>

              {/* Category Name */}
              <span className="text-[11px] font-semibold text-token group-hover:text-primary transition-colors truncate max-w-full">
                {cat.name.split(' ')[0]}
              </span>

              {/* Site Count under name */}
              <span className="text-[10px] text-token-text-faint font-mono">
                {cat.count ? `${cat.count} sites` : 'Explore'}
              </span>
            </button>
          </SpotlightCard>
        );
      })}
    </div>
  );
}
