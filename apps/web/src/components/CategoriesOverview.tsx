'use client';

import React from 'react';
import { CategoryTile } from './CategoryTile';
import { CATEGORIES_29_CATALOG, DirectoryCategoryItem } from '../lib/categories-data';

export interface CategoriesOverviewProps {
  categories?: DirectoryCategoryItem[];
}

export function CategoriesOverview({
  categories = CATEGORIES_29_CATALOG,
}: CategoriesOverviewProps) {
  return (
    <div className="w-full space-y-8 sm:space-y-10 py-2 sm:py-4">
      {/* 1. Centered Heading Block with Flanking Gradient Lines */}
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className="flex items-center justify-center gap-3 sm:gap-6 w-full max-w-xl px-2">
          {/* Left Gradient Line: transparent -> brand blue */}
          <div
            className="flex-1 h-[2px] rounded-full max-w-[48px] sm:max-w-[120px]"
            style={{
              background: 'linear-gradient(90deg, transparent, #2563EB)',
            }}
            aria-hidden="true"
          />

          {/* Centered H1 Title */}
          <h1 className="text-[28px] sm:text-[34px] md:text-[38px] lg:text-[40px] font-bold text-slate-900 dark:text-white font-heading tracking-tight whitespace-nowrap">
            Categories
          </h1>

          {/* Right Gradient Line: brand blue -> transparent */}
          <div
            className="flex-1 h-[2px] rounded-full max-w-[48px] sm:max-w-[120px]"
            style={{
              background: 'linear-gradient(90deg, #2563EB, transparent)',
            }}
            aria-hidden="true"
          />
        </div>

        {/* Subtitle */}
        <p className="text-fs-sm sm:text-fs-md text-[var(--text-2,#A8B3C7)] max-w-md px-4">
          Browse all categories and find your favorite links
        </p>
      </div>

      {/* 2. Responsive Neon Tile Grid */}
      {/* 2 columns on mobile (<560px), 3-4 on tablet, ~5 columns on desktop (>=1024px) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
        {/* First Tile: All Links */}
        <CategoryTile
          key="all-links"
          id="all-links"
          name="All Links"
          slug="all-links"
          href="/"
          iconName="LayoutGrid"
          accentColor="#2563EB"
          total={1820}
          showCount={true}
        />

        {/* 29 Seeded Categories */}
        {categories.map((cat) => (
          <CategoryTile
            key={cat.slug}
            id={cat.id}
            name={cat.name}
            slug={cat.slug}
            iconName={cat.iconName}
            accentColor={cat.themeColor}
            total={cat.total}
            showCount={true}
          />
        ))}
      </div>
    </div>
  );
}
