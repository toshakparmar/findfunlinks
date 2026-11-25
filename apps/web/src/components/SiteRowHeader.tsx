'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { NewBadge, Logo } from '@finallinks/ui';

export interface SiteRowHeaderProps {
  rank: number;
  name: string;
  displayName?: string | null;
  slug: string;
  faviconUrl?: string | null;
  bestDomainUrl?: string;
  domainsCount?: number;
  tags?: Array<{ id: string; name: string; slug: string }>;
  isNew?: boolean;
  accentColor?: string;
  expanded?: boolean;
  panelId?: string;
  headerId?: string;
  onToggle?: () => void;
  onExternalClick?: (url: string) => void;
}

export const SiteRowHeader: React.FC<SiteRowHeaderProps> = ({
  rank,
  name,
  displayName,
  slug,
  faviconUrl,
  bestDomainUrl,
  domainsCount = 1,
  tags = [],
  isNew = false,
  accentColor = '#2563EB',
  expanded = false,
  panelId,
  headerId,
  onToggle,
  onExternalClick,
}) => {
  const label = displayName || name;
  const prefetchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const prefetchPreview = () => {
    if (prefetchTimerRef.current) return;
    prefetchTimerRef.current = setTimeout(() => {
      fetch(`/api/public/websites/${encodeURIComponent(slug)}/preview`, {
        priority: 'low' as any,
      }).catch(() => {});
      prefetchTimerRef.current = null;
    }, 120);
  };

  const cancelPrefetch = () => {
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = null;
    }
  };

  const targetUrl = bestDomainUrl || `https://${name.toLowerCase().replace(/\s+/g, '')}.com`;

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExternalClick) {
      e.preventDefault();
      onExternalClick(targetUrl);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // If user clicked inside the link or button, let their handlers work
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    onToggle?.();
  };

  return (
    <div
      id={headerId}
      onClick={handleRowClick}
      onPointerEnter={prefetchPreview}
      onPointerLeave={cancelPrefetch}
      onFocus={prefetchPreview}
      className={`group/row w-full min-h-[38px] sm:min-h-[44px] flex items-center justify-between py-1 px-1.5 sm:px-2 rounded-lg transition-colors duration-150 select-none text-left cursor-pointer ${
        expanded
          ? 'bg-[var(--card-hover,#0E182F)] rounded-b-none'
          : 'hover:bg-[var(--card-hover,#0E182F)]'
      }`}
    >
      {/* Left section: Rank, Favicon, Title link, Badges */}
      <div className="flex items-center min-w-0 flex-1 mr-1.5 sm:mr-2">
        {/* Number marker (12-14px tabular) */}
        <span className="w-4 sm:w-5 text-right font-medium text-xs sm:text-fs-sm text-[var(--text-3,#6B7893)] mr-1.5 sm:mr-2 shrink-0 tabular-nums">
          {rank}.
        </span>

        {/* Site Name and Favicon Link directly to Website Detail Page */}
        <Link
          href={`/website/${encodeURIComponent(slug)}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center min-w-0 group/link mr-1.5 sm:mr-2 text-left select-none focus:outline-none"
          title={`View full details for ${name}`}
        >
          {/* Favicon 20px on mobile, 24px on sm+ */}
          <div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-[5px] sm:rounded-[6px] mr-1.5 sm:mr-2 shrink-0 flex items-center justify-center overflow-hidden bg-[var(--line,#1A2442)] transition-transform group-hover/link:scale-105"
            style={{
              border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
            }}
          >
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt=""
                width={24}
                height={24}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-full h-full items-center justify-center p-0.5 ${
                faviconUrl ? 'hidden' : 'flex'
              }`}
            >
              <Logo variant="mark" className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Name: 13px on mobile, 14-16px on sm+ */}
          <span className="truncate font-medium text-[13px] sm:text-sm md:text-fs-base text-slate-900 dark:text-[var(--text,#F1F5F9)] group-hover/link:text-[var(--primary,#2563EB)] dark:group-hover/link:text-brand-blue-400 transition-colors">
            {label}
          </span>
        </Link>

        {/* Badges container */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 ml-1">
          {isNew && <NewBadge />}

          {/* Tags (max 2 pills) */}
          {tags.slice(0, 2).map((t) => (
            <span
              key={t.id}
              className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-800/60 text-slate-400 border border-slate-700/50"
            >
              {t.name}
            </span>
          ))}

          {/* Mirror count indicator */}
          {domainsCount > 1 && (
            <span className="hidden md:inline-flex items-center text-[11px] text-[var(--text-3,#6B7893)] font-mono">
              {domainsCount} mirrors
            </span>
          )}
        </div>
      </div>

      {/* Right section: External Link and Chevron Button */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* External Link Icon (hidden on narrow mobile <= 479px per 4.1) */}
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleExternalClick}
          aria-label={`Open ${name} in a new tab`}
          className="hidden min-[480px]:flex items-center justify-center p-2 rounded-lg text-[var(--text-3,#6B7893)] hover:text-white hover:bg-slate-800/50 transition-colors shrink-0 cursor-pointer"
          title={`Open ${name} in a new tab`}
        >
          <ExternalLink className="w-3.5 h-3.5 stroke-[2] group-hover/row:stroke-[var(--accent,#3B82F6)] transition-colors" />
        </a>

        {/* Accessible Chevron Button (36x36 visual, 44x44 target) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-label={`${expanded ? 'Hide' : 'Show'} details for ${name}`}
          className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-lg text-[var(--text-3,#6B7893)] hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              expanded ? 'rotate-180 text-brand-blue-400' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
};
