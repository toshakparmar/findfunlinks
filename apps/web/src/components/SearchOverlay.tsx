'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CornerDownLeft } from 'lucide-react';

export interface SearchResultItem {
  id: string;
  name: string;
  displayName?: string | null;
  slug: string;
  categoryName?: string;
  accentColor?: string;
  faviconUrl?: string | null;
  bestDomainUrl?: string;
}

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => Promise<SearchResultItem[]> | SearchResultItem[];
  onSelectSite?: (site: SearchResultItem) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onSearch,
  onSelectSite,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleInputChange = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    if (onSearch) {
      setLoading(true);
      try {
        const res = await onSearch(val.trim());
        setResults(res || []);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 md:pt-20 px-3">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[var(--card,#0A1226)] border border-[var(--primary,#2563EB)]/40 rounded-2xl shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)] overflow-hidden z-10 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--line,#1A2442)] bg-[var(--header,#070D1E)]">
          <Search className="w-5 h-5 text-[var(--primary,#2563EB)] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search websites, movies, mirrors, categories..."
            className="w-full bg-transparent text-sm md:text-base text-slate-900 dark:text-white placeholder-[var(--text-3,#6B7893)] focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => handleInputChange('')}
              className="p-1 rounded-full text-[var(--text-3,#6B7893)] hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded border border-[var(--line,#1A2442)] text-[10px] text-[var(--text-3,#6B7893)] font-mono">
              ESC
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-[var(--text-2,#A8B3C7)]">
              Searching directories...
            </div>
          ) : results.length > 0 ? (
            results.map((site) => (
              <div
                key={site.id}
                onClick={() => {
                  onSelectSite?.(site);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--card-hover,#0E182F)] cursor-pointer transition-colors group select-none text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0 mr-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-[var(--line,#1A2442)] overflow-hidden shrink-0">
                    {site.faviconUrl ? (
                      <img src={site.faviconUrl} alt="" className="w-4 h-4 object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold text-white">
                        {site.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="truncate">
                    <span className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[var(--primary,#2563EB)] transition-colors">
                      {site.displayName || site.name}
                    </span>
                    {site.categoryName && (
                      <span className="text-[11px] text-[var(--text-3,#6B7893)] ml-2">
                        · {site.categoryName}
                      </span>
                    )}
                  </div>
                </div>

                <CornerDownLeft className="w-3.5 h-3.5 text-[var(--text-3,#6B7893)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          ) : query.trim() ? (
            <div className="p-8 text-center text-xs text-[var(--text-3,#6B7893)]">
              No matching websites or mirrors found for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[var(--text-3,#6B7893)] space-y-2">
              <p>Type to search across all verified directories and mirrors.</p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-2,#A8B3C7)]">
                <span className="px-2 py-0.5 rounded bg-[var(--header,#070D1E)] border border-[var(--line,#1A2442)]">
                  Movies
                </span>
                <span className="px-2 py-0.5 rounded bg-[var(--header,#070D1E)] border border-[var(--line,#1A2442)]">
                  Anime
                </span>
                <span className="px-2 py-0.5 rounded bg-[var(--header,#070D1E)] border border-[var(--line,#1A2442)]">
                  OTT
                </span>
                <span className="px-2 py-0.5 rounded bg-[var(--header,#070D1E)] border border-[var(--line,#1A2442)]">
                  Games
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
