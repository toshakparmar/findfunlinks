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
  accentColor = '#00A3FF',
  total,
  showCount = false,
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
      className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-[18px] min-h-[102px] sm:min-h-[114px] transition-all duration-200 select-none text-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary,#2563EB)] active:scale-[0.98] ${className}`}
      style={
        {
          '--tile-accent': accentColor,
        } as React.CSSProperties
      }
    >
      {/* Dynamic Themed Background & Border styling matching Images 2 & 3 */}
      <div
        className="absolute inset-0 rounded-[18px] transition-all duration-200 pointer-events-none"
        style={{
          background: `linear-gradient(145deg, color-mix(in srgb, ${accentColor} 8%, #070D1E) 0%, #050A18 100%)`,
          border: `2px solid ${accentColor}`,
          boxShadow: `0 0 16px -2px color-mix(in srgb, ${accentColor} 45%, transparent)`,
        }}
      />

      {/* Hover glow boost overlay */}
      <div
        className="absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          boxShadow: `0 0 24px 0px color-mix(in srgb, ${accentColor} 70%, transparent), 0 0 0 1px ${accentColor}`,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full transition-transform duration-200 group-hover:-translate-y-0.5 sm:group-hover:-translate-y-1">
        {/* Icon */}
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center mb-1.5 transition-transform duration-200 group-hover:scale-105"
          style={{ color: accentColor }}
        >
          <IconComponent
            className="w-7 h-7 sm:w-8 sm:h-8"
            strokeWidth={2}
            style={{
              filter: `drop-shadow(0 0 8px color-mix(in srgb, ${accentColor} 60%, transparent))`,
            }}
          />
        </div>

        {/* Label: bold white text centered below icon */}
        <span className="text-fs-sm sm:text-fs-base font-bold text-white tracking-tight leading-snug line-clamp-1 px-1 text-center transition-colors">
          {name}
        </span>

        {/* Small count line only if explicitly enabled */}
        {showCount && countText && (
          <span className="text-fs-xs font-medium text-slate-400 mt-0.5 tabular-nums transition-colors">
            {countText}
          </span>
        )}
      </div>
    </Link>
  );
}
