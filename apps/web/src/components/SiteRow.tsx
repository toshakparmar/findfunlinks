'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { SiteRowHeader } from './SiteRowHeader';

// Dynamically import SiteRowPanel lazily when expanded
const SiteRowPanel = dynamic(
  () => import('./SiteRowPanel').then((mod) => mod.SiteRowPanel),
  { ssr: false },
);

export interface SiteRowProps {
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
  categoryName?: string;
  categorySlug?: string;
  expanded?: boolean;
  panelId?: string;
  headerId?: string;
  onClick?: () => void; // Legacy support
  onToggle?: () => void;
  onExternalClick?: (url: string) => void;
  onReport?: (slug: string) => void;
}

export const SiteRow: React.FC<SiteRowProps> = ({
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
  categoryName,
  categorySlug,
  expanded = false,
  panelId = `panel-${slug}`,
  headerId = `header-${slug}`,
  onClick,
  onToggle,
  onExternalClick,
  onReport,
}) => {
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className="w-full transition-all duration-150">
      {/* Row Header */}
      <SiteRowHeader
        rank={rank}
        name={name}
        displayName={displayName}
        slug={slug}
        faviconUrl={faviconUrl}
        bestDomainUrl={bestDomainUrl}
        domainsCount={domainsCount}
        tags={tags}
        isNew={isNew}
        accentColor={accentColor}
        expanded={expanded}
        panelId={panelId}
        headerId={headerId}
        onToggle={handleToggle}
        onExternalClick={onExternalClick}
      />

      {/* Inline Expandable Dropdown Panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <SiteRowPanel
            slug={slug}
            categoryName={categoryName}
            categorySlug={categorySlug}
            accentColor={accentColor}
            panelId={panelId}
            headerId={headerId}
            onClose={handleToggle}
            onReport={onReport}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
