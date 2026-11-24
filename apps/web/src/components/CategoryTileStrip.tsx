'use client';

import React from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { CATEGORIES_29_CATALOG } from '../lib/categories-data';

const getIconComponent = (iconName?: string | null): React.ElementType => {
  if (!iconName) return Icons.LayoutGrid;
  const normalized = iconName.trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = (Icons as Record<string, any>)[normalized];
  return found || Icons.LayoutGrid;
};

export function CategoryTileStrip() {
  // Sort by homeOrder and take up to 15 categories
  const categories = CATEGORIES_29_CATALOG.slice(0, 15);

  return (
    <div className="w-full mb-6">
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 gap-2.5 sm:gap-3">
        {categories.map((cat, index) => {
          const IconComp = getIconComponent(cat.iconName);
          const accentColor = cat.themeColor;

          // Responsive visibility to maintain exactly 2 rows per breakpoint:
          // Mobile (<640px): 3 cols x 2 rows = 6 slots (show 0-4, plus All Categories)
          // Tablet (640-1023px): 4 cols x 2 rows = 8 slots (show 0-6, plus All Categories)
          // Desktop (1024-1919px): 6 cols x 2 rows = 12 slots (show 0-10, plus All Categories)
          // Ultrawide (>=1920px): 8 cols x 2 rows = 16 slots (show 0-14, plus All Categories)
          let visibilityClass = 'flex';
          if (index >= 5 && index < 7) {
            visibilityClass = 'hidden sm:flex';
          } else if (index >= 7 && index < 11) {
            visibilityClass = 'hidden lg:flex';
          } else if (index >= 11) {
            visibilityClass = 'hidden 2xl:flex';
          }

          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`group ${visibilityClass} flex-col items-center justify-center p-1.5 sm:p-2 rounded-[12px] sm:rounded-[14px] h-[72px] sm:h-[88px] transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary,#2563EB)] hover:-translate-y-0.5 active:scale-[0.98] shadow-sm hover:shadow-md`}
              style={{
                background: `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 16%, var(--card,#0A1226)), var(--card,#0A1226))`,
                border: `1.5px solid color-mix(in srgb, ${accentColor} 55%, var(--line,#1A2442))`,
              }}
            >
              <IconComp
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mb-1 sm:mb-1.5 transition-transform duration-150 group-hover:scale-110 shrink-0"
                style={{ color: accentColor }}
                strokeWidth={2}
              />
              <span className="text-[12px] sm:text-[14px] md:text-[15px] font-bold text-slate-900 dark:text-slate-100 text-center truncate max-w-full px-1 group-hover:text-primary dark:group-hover:text-white transition-colors">
                {cat.name}
              </span>
            </Link>
          );
        })}

        {/* Final Slot: Always 'All Categories' */}
        <Link
          href="/categories"
          className="group flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-[12px] sm:rounded-[14px] h-[72px] sm:h-[88px] transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary,#2563EB)] hover:-translate-y-0.5 active:scale-[0.98] shadow-sm hover:shadow-md"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, #2563EB 18%, var(--card,#0A1226)), var(--card,#0A1226))`,
            border: `1.5px solid color-mix(in srgb, #2563EB 60%, var(--line,#1A2442))`,
          }}
        >
          <Icons.LayoutGrid
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mb-1 sm:mb-1.5 text-[var(--brand-link,#3B82F6)] transition-transform duration-150 group-hover:scale-110 shrink-0"
            strokeWidth={2}
          />
          <span className="text-[12px] sm:text-[14px] md:text-[15px] font-bold text-primary dark:text-[var(--brand-link,#3B82F6)] text-center truncate max-w-full px-1 group-hover:underline transition-colors">
            All Categories
          </span>
        </Link>
      </div>
    </div>
  );
}
