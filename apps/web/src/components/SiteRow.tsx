'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

export interface SiteRowProps {
  rank: number;
  name: string;
  displayName?: string | null;
  slug: string;
  faviconUrl?: string | null;
  bestDomainUrl?: string;
  domainsCount?: number;
  accentColor?: string;
  onClick?: () => void;
  onExternalClick?: (url: string) => void;
}

export const SiteRow: React.FC<SiteRowProps> = ({
  rank,
  name,
  displayName,
  slug: _slug,
  faviconUrl,
  bestDomainUrl,
  domainsCount: _domainsCount = 1,
  accentColor = '#3B82F6',
  onClick,
  onExternalClick,
}) => {
  const label = displayName || name;
  const isMirror = label.toLowerCase().includes('(mirror)');

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetUrl = bestDomainUrl || `https://${name.toLowerCase().replace(/\s+/g, '')}.com`;
    if (onExternalClick) {
      onExternalClick(targetUrl);
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer,nofollow');
    }
  };

  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="group w-full flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-[var(--card-hover,#0E182F)] cursor-pointer transition-colors duration-150 select-none text-left"
    >
      <div className="flex items-center min-w-0 flex-1 mr-2">
        {/* Number marker */}
        <span className="w-5 text-right font-medium text-xs text-[var(--text-3,#6B7893)] mr-2 shrink-0 tabular-nums">
          {rank}.
        </span>

        {/* Favicon / Letter fallback */}
        <div
          className="w-5 h-5 rounded-[4px] mr-2 shrink-0 flex items-center justify-center overflow-hidden bg-[var(--line,#1A2442)]"
          style={{
            border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
          }}
        >
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              width={20}
              height={20}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to letter avatar on broken image
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span
              className="text-[10px] font-bold"
              style={{ color: accentColor }}
            >
              {firstLetter}
            </span>
          )}
        </div>

        {/* Name and optional mirror suffix */}
        <span className="truncate font-medium text-[13px] text-slate-900 dark:text-[var(--text,#F1F5F9)] group-hover:text-[var(--primary,#2563EB)] dark:group-hover:text-white transition-colors">
          {isMirror ? (
            <>
              {label.replace(/\(mirror\)/i, '').trim()}{' '}
              <span className="text-[11px] text-[var(--text-3,#6B7893)] font-normal">
                (Mirror)
              </span>
            </>
          ) : (
            label
          )}
        </span>
      </div>

      {/* External Link Icon */}
      <button
        type="button"
        onClick={handleExternalClick}
        aria-label={`Open ${name} in a new tab`}
        className="p-1 rounded text-[var(--text-3,#6B7893)] hover:text-white transition-colors shrink-0"
        title="Open working mirror"
      >
        <ExternalLink className="w-3.5 h-3.5 group-hover:stroke-[var(--accent,#3B82F6)] transition-colors" />
      </button>
    </div>
  );
};
