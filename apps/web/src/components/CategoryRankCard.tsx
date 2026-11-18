'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Compass,
} from 'lucide-react';
import { CategoryMeta } from '../lib/directory-data';
import { WebsiteCardData } from './DirectoryCard';

interface CategoryRankCardProps {
  category: CategoryMeta;
  websites: WebsiteCardData[];
  onOpenReportModal?: (website: WebsiteCardData) => void;
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

export function CategoryRankCard({ category, websites, onOpenReportModal }: CategoryRankCardProps) {
  const [filterType, setFilterType] = useState<'all' | 'featured' | 'popular'>('all');
  const [expandedWebsiteId, setExpandedWebsiteId] = useState<string | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);
  const [copiedDomainId, setCopiedDomainId] = useState<string | null>(null);

  // Filter items
  const filteredWebsites = websites.filter((w) => {
    if (filterType === 'featured') return w.isFeatured;
    if (filterType === 'popular') return (w.viewCount || 0) > 20000;
    return true;
  });

  const displayLimit = 10;
  const visibleWebsites = showAllItems ? filteredWebsites : filteredWebsites.slice(0, displayLimit);

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
  const themeColor = category.themeColor || '#3b82f6';

  return (
    <div
      id={`category-${category.slug}`}
      className="flex flex-col bg-[#141418] border border-[#24242c] rounded-lg shadow-sm overflow-hidden scroll-mt-20"
    >
      {/* 1. Tinted Category Header Strip (EverythingMoe signature design) */}
      <div
        className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#24242c] text-white select-none transition-colors"
        style={{
          backgroundColor: `${themeColor}14`, // subtle 8% tint
          borderTop: `2px solid ${themeColor}`,
        }}
      >
        {/* Title & Icon */}
        <div className="flex items-center gap-2 font-semibold text-sm tracking-wide">
          <IconComponent className="w-4 h-4" style={{ color: themeColor }} />
          <Link
            href={`/category/${category.slug}`}
            className="hover:underline flex items-center gap-1.5"
          >
            <span>{category.name}</span>
          </Link>
          <span className="text-[10px] text-neutral-400 font-normal">
            ({filteredWebsites.length})
          </span>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="appearance-none bg-[#111115] hover:bg-[#191920] border border-[#2e2e38] text-[11px] font-medium text-neutral-300 rounded px-2.5 py-1 pr-6 focus:outline-none cursor-pointer transition-colors"
            >
              <option value="all">Any</option>
              <option value="featured">Featured</option>
              <option value="popular">Popular</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 text-neutral-400">
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          <Link
            href={`/category/${category.slug}`}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
            title="Open category page"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Ranked List of Websites */}
      <div className="divide-y divide-[#1e1e26] text-xs">
        {visibleWebsites.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 text-xs">
            No websites match the selected filter.
          </div>
        ) : (
          visibleWebsites.map((site, index) => {
            const isExpanded = expandedWebsiteId === site.id;
            const domains = site.domains || [];
            const hasActiveMirrors = domains.some((d) => d.status === 'ACTIVE');

            return (
              <div
                key={site.id}
                className={`transition-colors ${
                  isExpanded ? 'bg-[#18181f]' : 'hover:bg-[#18181e]'
                }`}
              >
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(site.id)}
                  className="flex items-center justify-between px-3 py-2 cursor-pointer group"
                >
                  {/* Left: Rank + Favicon + Title + Badges */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {/* Rank Number */}
                    <span className="w-5 text-right font-bold text-neutral-500 tabular-nums text-[11px] group-hover:text-neutral-300">
                      {index + 1}.
                    </span>

                    {/* Logo / Favicon */}
                    <div className="w-5 h-5 rounded shrink-0 bg-[#22222a] flex items-center justify-center overflow-hidden border border-neutral-700/50">
                      {site.logoUrl ? (
                        <img
                          src={site.logoUrl}
                          alt={site.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-300">
                          {site.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Site Name */}
                    <span className="font-medium text-neutral-200 group-hover:text-white truncate">
                      {site.name}
                    </span>

                    {/* Feature Badges */}
                    <div className="flex items-center gap-1 shrink-0">
                      {site.tags?.slice(0, 2).map((t) => (
                        <span
                          key={t.id || t.slug}
                          className="px-1.5 py-0.2 rounded text-[9px] font-semibold tracking-wider bg-[#22222a] text-neutral-400 border border-neutral-700/60 uppercase"
                        >
                          {t.name}
                        </span>
                      ))}
                      {domains.length > 1 && (
                        <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold text-blue-400 bg-blue-950/40 border border-blue-800/40">
                          {domains.length} MIRRORS
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Status Indicator & Chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Live Status indicator dot */}
                    {hasActiveMirrors && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"
                        title="Mirrors online and responding"
                      />
                    )}

                    {/* Accordion Toggle Chevron */}
                    <button
                      type="button"
                      className="p-1 text-neutral-500 group-hover:text-neutral-300"
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

                {/* Expanded Accordion Details Panel */}
                {isExpanded && (
                  <div className="px-4 py-3 bg-[#111116] border-t border-[#1f1f28] space-y-3">
                    {/* Tagline / Description */}
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {site.tagline || site.description}
                    </p>

                    {/* Mirror Fleet Box */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400">
                        <span>Working Domains & Mirrors ({domains.length}):</span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Health Checked
                        </span>
                      </div>

                      <div className="space-y-1">
                        {domains.map((dom) => (
                          <div
                            key={dom.id}
                            className="flex items-center justify-between p-2 rounded bg-[#181820] border border-[#272733] hover:border-neutral-600 transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  dom.type === 'PRIMARY'
                                    ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                                }`}
                              >
                                {dom.type}
                              </span>
                              <span className="font-mono text-xs text-neutral-200 truncate">
                                {dom.hostname}
                              </span>
                              {dom.lastResponseMs && (
                                <span className="text-[10px] text-emerald-400 font-medium">
                                  {dom.lastResponseMs}ms
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleCopy(dom.id, dom.url, e)}
                                title="Copy mirror URL"
                                className="p-1 rounded bg-[#20202a] text-neutral-400 hover:text-white transition-colors"
                              >
                                {copiedDomainId === dom.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <a
                                href={dom.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-medium text-[11px] shadow-sm transition-colors"
                              >
                                <span>Visit</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[11px]">
                      <Link
                        href={`/website/${site.slug}`}
                        className="text-brand-blue-400 hover:text-brand-blue-300 font-medium hover:underline inline-flex items-center gap-1"
                      >
                        <span>View full profile & stats</span>
                        <ChevronDown className="w-3 h-3 -rotate-90" />
                      </Link>

                      {onOpenReportModal && (
                        <button
                          type="button"
                          onClick={() => onOpenReportModal(site)}
                          className="inline-flex items-center gap-1 text-neutral-500 hover:text-amber-400 transition-colors"
                        >
                          <ShieldAlert className="w-3 h-3" />
                          <span>Report Broken Link</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. Card Footer (View All Toggle) */}
      {filteredWebsites.length > displayLimit && (
        <div className="p-2 border-t border-[#202028] bg-[#111116] text-center">
          <button
            type="button"
            onClick={() => setShowAllItems(!showAllItems)}
            className="w-full py-1 text-xs font-medium text-neutral-400 hover:text-white transition-colors inline-flex items-center justify-center gap-1.5"
          >
            {showAllItems ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>View all ({filteredWebsites.length} websites)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
