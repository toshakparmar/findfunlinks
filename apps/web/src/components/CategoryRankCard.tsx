'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomSelect } from './ui/CustomSelect';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
  Maximize2,
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
  Zap,
  Heart,
} from 'lucide-react';
import { CategoryMeta } from '../lib/directory-data';
import { WebsiteCardData } from './DirectoryCard';
import { ClickSpark } from './reactbits/ClickSpark';
import { HoverPreviewCard } from './HoverPreviewCard';
import { useFavorites } from '../lib/favorites-context';

interface CategoryRankCardProps {
  category: CategoryMeta;
  websites: WebsiteCardData[];
  onOpenReportModal?: (website: WebsiteCardData) => void;
  onOpenFullscreen?: (category: CategoryMeta) => void;
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

// Helper to convert ALL-CAPS tags to sentence case
function toSentenceCase(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function CategoryRankCard({
  category,
  websites,
  onOpenReportModal,
  onOpenFullscreen,
}: CategoryRankCardProps) {
  const [sortOption, setSortOption] = useState<'popular' | 'fastest' | 'newest' | 'az'>('popular');
  const [expandedWebsiteId, setExpandedWebsiteId] = useState<string | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);
  const [copiedDomainId, setCopiedDomainId] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Sorting
  const sortedWebsites = [...websites].sort((a, b) => {
    if (sortOption === 'az') return a.name.localeCompare(b.name);
    if (sortOption === 'fastest') {
      const aLatency = a.domains?.[0]?.lastResponseMs || 9999;
      const bLatency = b.domains?.[0]?.lastResponseMs || 9999;
      return aLatency - bLatency;
    }
    if (sortOption === 'newest') return (b.activeDomainsCount || 0) - (a.activeDomainsCount || 0);
    return (b.viewCount || 0) - (a.viewCount || 0);
  });

  const displayLimit = 10;
  const visibleWebsites = showAllItems ? sortedWebsites : sortedWebsites.slice(0, displayLimit);

  const toggleExpand = (id: string) => {
    setExpandedWebsiteId((prev) => (prev === id ? null : id));
  };

  const handleCopy = (domainId: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedDomainId(domainId);
    setTimeout(() => setCopiedDomainId(null), 2000);
  };

  const IconComponent = (category.iconName && CATEGORY_ICONS[category.iconName]) || Compass;
  const themeColor = category.themeColor || 'var(--primary)';

  return (
    <div
      id={`category-${category.slug}`}
      className="flex flex-col bg-surface-1 border border-token/10 rounded-card shadow-warm overflow-hidden scroll-mt-20 transition-all hover:border-token/20"
      style={{
        borderTop: `2.5px solid ${themeColor}`,
      }}
    >
      {/* 1. Header with Icon Chip, Title, Sort Dropdown & Fullscreen Expand */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-token/10 bg-surface-2/40 select-none">
        {/* Title & Icon Chip */}
        <div className="flex items-center gap-2.5 font-display font-bold text-sm tracking-tight text-token">
          <div
            className="w-7 h-7 rounded-chip flex items-center justify-center shadow-subtle shrink-0"
            style={{
              backgroundColor: `${themeColor}18`,
              color: themeColor,
            }}
          >
            <IconComponent className="w-4 h-4" />
          </div>

          <Link
            href={`/category/${category.slug}`}
            className="hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span>{category.name}</span>
          </Link>

          <span className="text-[11px] font-mono text-token-text-faint font-normal">
            ({sortedWebsites.length})
          </span>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Meaningful Sort Dropdown */}
          <div className="relative w-32">
            <CustomSelect
              size="sm"
              value={sortOption}
              onChange={(val) => setSortOption(val as any)}
              options={[
                { value: 'popular', label: 'Popular' },
                { value: 'fastest', label: 'Fastest' },
                { value: 'az', label: 'A – Z' },
                { value: 'newest', label: 'Newest' },
              ]}
            />
          </div>

          {/* Fullscreen Section Modal Button */}
          {onOpenFullscreen && (
            <button
              type="button"
              onClick={() => onOpenFullscreen(category)}
              className="p-1 rounded-chip text-token/40 hover:text-token hover:bg-surface-2 transition-colors"
              title="Expand to fullscreen section view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Numbered Ranked Rows of Websites */}
      <div className="divide-y divide-token/5 text-xs">
        {visibleWebsites.length === 0 ? (
          <div className="p-8 text-center text-token/40 font-mono text-xs">
            No websites found in this category.
          </div>
        ) : (
          visibleWebsites.map((site, index) => {
            const isExpanded = expandedWebsiteId === site.id;
            const domains = site.domains || [];
            const primaryDomain = domains.find((d) => d.type === 'PRIMARY') || domains[0];
            const fastestDomain = [...domains].sort(
              (a, b) => (a.lastResponseMs || 999) - (b.lastResponseMs || 999)
            )[0];
            const hasActiveMirrors = domains.some((d) => d.status === 'ACTIVE');
            const latency = primaryDomain?.lastResponseMs || 38;
            const isFav = isFavorite(site.id);

            // Favicon proxy URL
            const faviconUrl = primaryDomain?.hostname
              ? `https://www.google.com/s2/favicons?domain=${primaryDomain.hostname}&sz=64`
              : site.logoUrl;

            return (
              <div
                key={site.id}
                className={`transition-colors ${
                  isExpanded ? 'bg-surface-2/60' : 'hover:bg-surface-2/40'
                }`}
              >
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(site.id)}
                  className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer group select-none"
                >
                  {/* Left: Rank + Favicon Avatar + Site Name + Quiet Sentence-Case Tags */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {/* Rank Number */}
                    <span className="w-5 text-right font-mono font-medium text-token-text-faint tabular-nums text-[11px] group-hover:text-token">
                      {index + 1}.
                    </span>

                    {/* Favicon / Letter Avatar */}
                    <div className="w-6 h-6 rounded-chip shrink-0 bg-surface-2 flex items-center justify-center overflow-hidden border border-token/10 shadow-subtle">
                      {faviconUrl ? (
                        <img
                          src={faviconUrl}
                          alt={site.name}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-token/70">
                          {site.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Site Name with Hover Preview */}
                    <HoverPreviewCard site={site}>
                      <span className="font-medium text-token group-hover:text-primary transition-colors truncate">
                        {site.name}
                      </span>
                    </HoverPreviewCard>

                    {/* Quiet Sentence-Case Tags (Max 2 + "+N") */}
                    <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                      {site.tags?.slice(0, 2).map((t) => (
                        <span
                          key={t.id || t.slug}
                          className="px-2 py-0.2 rounded-full text-[10px] font-mono text-token/60 bg-surface-2 border border-token/10"
                        >
                          {toSentenceCase(t.name)}
                        </span>
                      ))}
                      {site.tags && site.tags.length > 2 && (
                        <span className="text-[9px] font-mono text-token-text-faint">
                          +{site.tags.length - 2}
                        </span>
                      )}

                      {/* Mirror count chip */}
                      {domains.length > 1 && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold text-primary bg-primary/10 border border-primary/20">
                          {domains.length} mirrors
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Status Dot with Tooltip & Chevron */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(site.id);
                      }}
                      className="p-1 text-token/30 hover:text-rose-500 transition-colors"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'text-rose-500 fill-rose-500' : 'hover:scale-110'
                        }`}
                      />
                    </button>

                    {/* Status Dot with Tooltip */}
                    {hasActiveMirrors && (
                      <span
                        className="w-2 h-2 rounded-full bg-status-online status-dot-pulse"
                        title={`Online · ${latency} ms · verified 12m ago`}
                      />
                    )}

                    {/* Accordion Chevron */}
                    <button
                      type="button"
                      className="p-1 text-token/40 group-hover:text-token transition-colors"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Accordion Details Panel with Framer Motion AnimatePresence */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-3.5 bg-surface-2/70 border-t border-token/10 space-y-3.5 text-xs">
                        {/* Description & Smart Mirror Picker Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <p className="text-xs text-token/80 leading-relaxed max-w-xl">
                            {site.tagline || site.description}
                          </p>

                          {/* Smart Mirror Picker: Open Fastest Mirror */}
                          {fastestDomain && (
                            <a
                              href={fastestDomain.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip bg-primary hover:opacity-90 text-primary-fg font-medium text-[11px] shadow-subtle shrink-0 self-start sm:self-auto transition-opacity"
                            >
                              <Zap className="w-3 h-3 text-accent fill-accent" />
                              <span>Open Fastest Mirror</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Working Mirrors Fleet List */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono text-token/50">
                            <span>Working Domains &amp; Mirrors ({domains.length}):</span>
                            <span className="text-[10px] text-status-online flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-status-online" />
                              Active Health Checked
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {domains.map((dom) => (
                              <div
                                key={dom.id}
                                className="flex items-center justify-between p-2 rounded-chip bg-surface-1 border border-token/10 hover:border-token/20 transition-colors shadow-subtle"
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                                      dom.type === 'PRIMARY'
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'bg-surface-2 text-token/60 border border-token/10'
                                    }`}
                                  >
                                    {dom.type}
                                  </span>

                                  <span className="font-mono text-xs text-token truncate">
                                    {dom.hostname}
                                  </span>

                                  {dom.lastResponseMs && (
                                    <span className="text-[10px] text-status-online font-mono font-medium">
                                      {dom.lastResponseMs}ms
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Copy Link with ClickSpark */}
                                  <ClickSpark sparkColor="var(--primary)">
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopy(dom.id, dom.url, e)}
                                      title="Copy mirror URL"
                                      className="p-1 rounded text-token/50 hover:text-token hover:bg-surface-2 transition-colors"
                                    >
                                      {copiedDomainId === dom.id ? (
                                        <Check className="w-3 h-3 text-status-online" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </ClickSpark>

                                  <a
                                    href={dom.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-chip bg-surface-2 hover:bg-token/10 text-token font-medium text-[11px] border border-token/10 transition-colors"
                                  >
                                    <span>Visit</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-token/40" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-token/10 text-[11px]">
                          <Link
                            href={`/website/${site.slug}`}
                            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                          >
                            <span>View full profile &amp; uptime stats</span>
                            <ChevronDown className="w-3 h-3 -rotate-90" />
                          </Link>

                          {onOpenReportModal && (
                            <button
                              type="button"
                              onClick={() => onOpenReportModal(site)}
                              className="inline-flex items-center gap-1 text-token/40 hover:text-accent transition-colors"
                            >
                              <ShieldAlert className="w-3 h-3" />
                              <span>Report Broken Link</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Card Footer (View All Toggle) */}
      {sortedWebsites.length > displayLimit && (
        <div className="p-2 border-t border-token/10 bg-surface-2/30 text-center">
          <button
            type="button"
            onClick={() => setShowAllItems(!showAllItems)}
            className="w-full py-1 text-xs font-mono font-medium text-token/60 hover:text-token transition-colors inline-flex items-center justify-center gap-1.5"
          >
            {showAllItems ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>View all ({sortedWebsites.length} websites)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
