'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Layers,
  FileText,
  Compass,
  ArrowRight,
  Globe,
  Sparkles,
  X,
} from 'lucide-react';
import { CategoryMeta, FALLBACK_CATEGORIES, FALLBACK_WEBSITES } from '../lib/directory-data';
import { WebsiteCardData } from './DirectoryCard';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: CategoryMeta[];
  websites?: WebsiteCardData[];
}

export function CommandPalette({
  isOpen,
  onClose,
  categories = FALLBACK_CATEGORIES,
  websites = FALLBACK_WEBSITES,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter items
  const cleanQ = query.toLowerCase().trim();

  const matchedWebsites = cleanQ
    ? websites
        .filter(
          (w) =>
            w.name.toLowerCase().includes(cleanQ) ||
            w.description?.toLowerCase().includes(cleanQ) ||
            w.domains?.some((d) => d.hostname.toLowerCase().includes(cleanQ))
        )
        .slice(0, 5)
    : websites.slice(0, 4);

  const matchedCategories = cleanQ
    ? categories
        .filter((c) => c.name.toLowerCase().includes(cleanQ) || c.slug.toLowerCase().includes(cleanQ))
        .slice(0, 3)
    : categories.slice(0, 3);

  const pages = [
    { name: 'Main Index', href: '/', icon: Compass, desc: 'Curated toplist with mirror fleet' },
    { name: 'Simple Index', href: '/#simple', icon: Layers, desc: 'Alphabetical directory view' },
    { name: 'Submit a Website', href: '/register', icon: Sparkles, desc: 'Add new fun website' },
    { name: 'About & FAQ', href: '/about', icon: FileText, desc: 'Platform & fleet monitoring guide' },
    { name: 'DMCA Notice', href: '/dmca', icon: FileText, desc: 'Copyright & takedown policy' },
  ];

  const matchedPages = cleanQ
    ? pages.filter((p) => p.name.toLowerCase().includes(cleanQ) || p.desc.toLowerCase().includes(cleanQ))
    : pages.slice(0, 3);

  // Flattened results for keyboard navigation
  type ResultItem =
    | { type: 'website'; data: WebsiteCardData; href: string }
    | { type: 'category'; data: CategoryMeta; href: string }
    | { type: 'page'; data: (typeof pages)[0]; href: string };

  const flattenedResults: ResultItem[] = [
    ...matchedWebsites.map((w) => ({ type: 'website' as const, data: w, href: `/website/${w.slug}` })),
    ...matchedCategories.map((c) => ({ type: 'category' as const, data: c, href: `/category/${c.slug}` })),
    ...matchedPages.map((p) => ({ type: 'page' as const, data: p, href: p.href })),
  ];

  const handleSelect = (item: ResultItem) => {
    onClose();
    if (item.href.startsWith('http')) {
      window.open(item.href, '_blank');
    } else {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flattenedResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flattenedResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flattenedResults.length) % flattenedResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = flattenedResults[selectedIndex];
      if (selected) handleSelect(selected);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-surface-1 border border-token/20 rounded-card shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-token/10 bg-surface-2/50">
          <Search className="w-5 h-5 text-token/40 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search websites, mirrors, categories, or pages..."
            className="w-full bg-transparent text-sm text-token placeholder:text-token/40 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-token/40 hover:text-token transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="px-2 py-0.5 text-[10px] font-mono rounded bg-surface-1 border border-token/20 text-token/50">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-token/5 space-y-2 text-xs">
          {flattenedResults.length === 0 ? (
            <div className="py-12 text-center text-token/50">
              No matching websites or categories found for &quot;{query}&quot;.
            </div>
          ) : (
            <>
              {/* Websites section */}
              {matchedWebsites.length > 0 && (
                <div className="pt-1">
                  <div className="px-3 py-1 text-[11px] font-semibold text-token/40 uppercase tracking-wider font-mono">
                    Websites & Working Mirrors
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchedWebsites.map((site) => {
                      const itemIndex = flattenedResults.findIndex(
                        (r) => r.type === 'website' && r.data.id === site.id
                      );
                      const isSelected = selectedIndex === itemIndex;
                      const primaryHostname = site.domains?.[0]?.hostname || site.slug;

                      return (
                        <div
                          key={site.id}
                          onClick={() =>
                            handleSelect({
                              type: 'website',
                              data: site,
                              href: `/website/${site.slug}`,
                            })
                          }
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2 rounded-row cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-token/10 text-token font-medium'
                              : 'text-token/70 hover:bg-surface-2'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-6 h-6 rounded-chip bg-surface-2 flex items-center justify-center shrink-0 border border-token/10 font-bold text-[10px]">
                              {site.name.charAt(0)}
                            </div>
                            <div className="truncate">
                              <span className="text-token font-medium">{site.name}</span>
                              <span className="ml-2 text-[11px] text-token/40 font-mono">
                                {primaryHostname}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {site.domains && site.domains.length > 1 && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-primary bg-primary/10">
                                {site.domains.length} mirrors
                              </span>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-token/40" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Categories Section */}
              {matchedCategories.length > 0 && (
                <div className="pt-2">
                  <div className="px-3 py-1 text-[11px] font-semibold text-token/40 uppercase tracking-wider font-mono">
                    Directory Categories
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchedCategories.map((cat) => {
                      const itemIndex = flattenedResults.findIndex(
                        (r) => r.type === 'category' && r.data.id === cat.id
                      );
                      const isSelected = selectedIndex === itemIndex;

                      return (
                        <div
                          key={cat.id}
                          onClick={() =>
                            handleSelect({
                              type: 'category',
                              data: cat,
                              href: `/category/${cat.slug}`,
                            })
                          }
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2 rounded-row cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-token/10 text-token font-medium'
                              : 'text-token/70 hover:bg-surface-2'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Globe className="w-4 h-4 text-accent" />
                            <span>{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-token/40 font-mono">Jump to section</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pages Section */}
              {matchedPages.length > 0 && (
                <div className="pt-2">
                  <div className="px-3 py-1 text-[11px] font-semibold text-token/40 uppercase tracking-wider font-mono">
                    Pages & Tools
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchedPages.map((pg) => {
                      const itemIndex = flattenedResults.findIndex(
                        (r) => r.type === 'page' && r.data.name === pg.name
                      );
                      const isSelected = selectedIndex === itemIndex;
                      const Icon = pg.icon;

                      return (
                        <div
                          key={pg.name}
                          onClick={() =>
                            handleSelect({
                              type: 'page',
                              data: pg,
                              href: pg.href,
                            })
                          }
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2 rounded-row cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-token/10 text-token font-medium'
                              : 'text-token/70 hover:bg-surface-2'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-token/50" />
                            <div>
                              <span>{pg.name}</span>
                              <span className="ml-2 text-[11px] text-token/40">{pg.desc}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-token/40" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-token/10 bg-surface-2/40 text-[11px] text-token/40 font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-surface-1 border border-token/20">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 rounded bg-surface-1 border border-token/20">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-token/20">↵</kbd> to select
            </span>
          </div>
          <span>FindFunLinks v2.0</span>
        </div>
      </div>
    </div>
  );
}

