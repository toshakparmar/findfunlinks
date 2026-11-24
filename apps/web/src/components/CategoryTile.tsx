'use client';

import React from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';

export interface CategoryTileProps {
  id?: string;
  name: string;
  slug: string;
  iconName?: string | null;
  accentColor?: string;
  total?: number;
  showCount?: boolean;
  href?: string;
  className?: string;
}

const getIconComponent = (iconName?: string | null): React.ElementType => {
  if (!iconName) return Icons.LayoutGrid;
  const normalized = iconName.trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = (Icons as Record<string, any>)[normalized];
  return found || Icons.LayoutGrid;
};

export function CategoryTile({
  name,
  slug,
  iconName,
  accentColor = '#3B82F6',
  total,
  showCount = true,
  href,
  className = '',
}: CategoryTileProps) {
  const IconComponent = getIconComponent(iconName);
  const targetHref = href || (slug === 'all-links' ? '/' : `/category/${slug}`);
  const countText = typeof total === 'number' ? `${total} sites` : '';
  const ariaLabel = total ? `${name}, ${total} websites` : name;

  return (
    <Link
      href={targetHref}
      aria-label={ariaLabel}
      className={`group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-[18px] min-h-[108px] sm:min-h-[120px] transition-all duration-200 select-none text-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary,#2563EB)] active:scale-[0.98] ${className}`}
      style={
        {
          '--tile-accent': accentColor,
        } as React.CSSProperties
      }
    >
      {/* Dynamic Themed Background & Border styling */}
      <div
        className="absolute inset-0 rounded-[18px] transition-all duration-200 pointer-events-none"
        style={{
          background: `linear-gradient(145deg, color-mix(in srgb, ${accentColor} 26%, var(--card,#0A1226)) 0%, color-mix(in srgb, ${accentColor} 6%, var(--bg,#050A18)) 100%)`,
          border: `2px solid color-mix(in srgb, ${accentColor} 85%, transparent)`,
          boxShadow: `0 0 22px -8px color-mix(in srgb, ${accentColor} 55%, transparent)`,
        }}
      />

      {/* Hover glow boost overlay */}
      <div
        className="absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          boxShadow: `0 0 28px -4px color-mix(in srgb, ${accentColor} 75%, transparent), 0 0 0 1px color-mix(in srgb, ${accentColor} 95%, transparent)`,
        }}
      />

      {/* Content Container (lift -3px on desktop hover) */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full transition-transform duration-200 group-hover:-translate-y-0.5 sm:group-hover:-translate-y-1">
        {/* Icon: 40-44px */}
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center mb-2 transition-transform duration-200 group-hover:scale-105"
          style={{ color: accentColor }}
        >
          <IconComponent
            className="w-7 h-7 sm:w-8 sm:h-8"
            strokeWidth={2}
            style={{
              filter: `drop-shadow(0 0 8px color-mix(in srgb, ${accentColor} 40%, transparent))`,
            }}
          />
        </div>

        {/* Label: 16-18px/600, wraps up to 2 lines */}
        <span className="text-fs-sm sm:text-fs-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-2 px-1 text-center transition-colors">
          {name}
        </span>

        {/* Small muted count line: 13-14px */}
        {showCount && countText && (
          <span className="text-fs-xs font-medium text-slate-600 dark:text-[var(--text-2,#A8B3C7)] mt-0.5 tabular-nums transition-colors">
            {countText}
          </span>
        )}
      </div>
    </Link>
  );
}
