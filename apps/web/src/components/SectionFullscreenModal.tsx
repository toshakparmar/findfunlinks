'use client';

import React, { useState } from 'react';
import { X, Search, ExternalLink, Copy, Check, ShieldAlert } from 'lucide-react';
import { CustomSelect } from './ui/CustomSelect';
import { CategoryMeta } from '../lib/directory-data';
import { WebsiteCardData } from './DirectoryCard';

interface SectionFullscreenModalProps {
  category: CategoryMeta;
  websites: WebsiteCardData[];
  isOpen: boolean;
  onClose: () => void;
  onOpenReportModal?: (site: WebsiteCardData) => void;
}

export function SectionFullscreenModal({
  category,
  websites,
  isOpen,
  onClose,
  onOpenReportModal,
}: SectionFullscreenModalProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'popular' | 'fastest' | 'az'>('popular');
  const [copiedDomainId, setCopiedDomainId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedDomainId(id);
    setTimeout(() => setCopiedDomainId(null), 2000);
  };

  const filtered = websites
    .filter(
      (w) =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.description?.toLowerCase().includes(search.toLowerCase()) ||
        w.tags?.some((t) => t.name.toLowerCase().includes(search.toLowerCase())),
    )
    .sort((a, b) => {
      if (sort === 'az') return a.name.localeCompare(b.name);
      if (sort === 'fastest') {
        const aLatency = a.domains?.[0]?.lastResponseMs || 9999;
        const bLatency = b.domains?.[0]?.lastResponseMs || 9999;
        return aLatency - bLatency;
      }
      return (b.viewCount || 0) - (a.viewCount || 0);
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[88vh] bg-surface-1 border border-token/20 rounded-card shadow-2xl flex flex-col overflow-hidden">
        {/* Header with Category Accent */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-token/10 bg-surface-2/60"
          style={{ borderTop: `3px solid ${category.themeColor || 'var(--primary)'}` }}
        >
          <div className="flex items-center gap-3">
            <h2 className="font-display font-bold text-lg text-token tracking-tight">
              {category.name}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-surface-1 border border-token/10 text-token/70">
              {filtered.length} entries
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-chip text-token/50 hover:text-token hover:bg-surface-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 border-b border-token/10 bg-surface-2/30 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-token/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search in ${category.name}...`}
              className="w-full pl-9 pr-3 py-2 bg-surface-1 border border-token/15 rounded-chip text-token placeholder:text-token/40 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-48">
            <CustomSelect
              size="sm"
              value={sort}
              onChange={(val) => setSort(val as any)}
              options={[
                { value: 'popular', label: 'Most Popular' },
                { value: 'fastest', label: 'Fastest Response' },
                { value: 'az', label: 'Alphabetical (A-Z)' },
              ]}
            />
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-token/40">
              No results found matching your search.
            </div>
          ) : (
            filtered.map((site, index) => (
              <div
                key={site.id}
                className="p-4 rounded-row bg-surface-2/50 border border-token/10 hover:border-token/20 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-right font-mono font-bold text-token/40 text-xs">
                      {index + 1}.
                    </span>
                    <div className="w-8 h-8 rounded-chip bg-surface-1 border border-token/10 flex items-center justify-center font-bold text-sm shrink-0">
                      {site.logoUrl ? (
                        <img
                          src={site.logoUrl}
                          alt={site.name}
                          className="w-full h-full object-cover rounded-chip"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        site.name.charAt(0)
                      )}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-token text-sm truncate">{site.name}</h4>
                        <div className="flex items-center gap-1">
                          {site.tags?.slice(0, 2).map((t) => (
                            <span
                              key={t.id}
                              className="px-1.5 py-0.2 rounded text-[10px] font-mono text-token/60 bg-surface-1 border border-token/10"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-token/60 line-clamp-1 mt-0.5">
                        {site.tagline || site.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onOpenReportModal && (
                      <button
                        type="button"
                        onClick={() => onOpenReportModal(site)}
                        className="p-1.5 rounded-chip text-token/40 hover:text-accent hover:bg-surface-1 transition-colors"
                        title="Report broken mirror"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {site.domains?.[0] && (
                      <a
                        href={site.domains[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-chip bg-primary text-primary-fg hover:opacity-90 font-medium text-xs shadow-subtle transition-opacity"
                      >
                        <span>Visit Site</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Mirrors summary */}
                {site.domains && site.domains.length > 0 && (
                  <div className="pt-2 border-t border-token/5 flex flex-wrap items-center gap-2 text-[11px] text-token/60 font-mono">
                    <span className="text-token/40">Working Mirrors:</span>
                    {site.domains.map((dom) => (
                      <span
                        key={dom.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-1 border border-token/10"
                      >
                        <span>{dom.hostname}</span>
                        {dom.lastResponseMs && (
                          <span className="text-status-online text-[10px]">
                            {dom.lastResponseMs}ms
                          </span>
                        )}
                        <button
                          onClick={() => handleCopy(dom.id, dom.url)}
                          className="hover:text-token ml-1"
                          title="Copy mirror URL"
                        >
                          {copiedDomainId === dom.id ? (
                            <Check className="w-2.5 h-2.5 text-status-online" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
