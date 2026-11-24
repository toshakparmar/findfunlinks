'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, SlidersHorizontal, Check } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface PageHeaderProps {
  title: string;
  count?: number;
  countLabel?: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filterGroups?: FilterGroup[];
  selectedFilters: Record<string, string>;
  onFilterChange: (groupId: string, value: string) => void;
  filterButtonLabel?: string;
  className?: string;
}

export const DEFAULT_CATEGORY_FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'sort',
    label: 'Sort by',
    options: [
      { value: 'featured', label: 'Featured order' },
      { value: 'starred', label: 'Most starred' },
      { value: 'newest', label: 'Newest' },
      { value: 'az', label: 'A–Z' },
    ],
  },
  {
    id: 'show',
    label: 'Show',
    options: [
      { value: 'all', label: 'All sites' },
      { value: 'online', label: 'Online only' },
      { value: 'mirrors', label: 'Has mirrors' },
    ],
  },
];

export function PageHeader({
  title,
  count,
  countLabel = 'websites',
  subtitle,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filterGroups = DEFAULT_CATEGORY_FILTER_GROUPS,
  selectedFilters,
  onFilterChange,
  filterButtonLabel,
  className = '',
}: PageHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute active summary label for button
  const summaryLabel = React.useMemo(() => {
    if (filterButtonLabel) return filterButtonLabel;

    // Use primary sort value as primary label
    const activeSortVal = selectedFilters['sort'];
    const sortGroup = filterGroups.find((g) => g.id === 'sort');
    const sortOption = sortGroup?.options.find((o) => o.value === activeSortVal);

    const activeShowVal = selectedFilters['show'];
    const hasShowFilter = activeShowVal && activeShowVal !== 'all';

    if (sortOption && hasShowFilter) {
      const showGroup = filterGroups.find((g) => g.id === 'show');
      const showOption = showGroup?.options.find((o) => o.value === activeShowVal);
      return `${sortOption.label} · ${showOption?.label || ''}`;
    }

    if (sortOption) return sortOption.label;
    return 'Filter & Sort';
  }, [filterButtonLabel, selectedFilters, filterGroups]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <header className={`w-full space-y-4 sm:space-y-5 ${className}`}>
      {/* Row 1: Title (H1) + muted count */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline flex-wrap gap-x-2.5 gap-y-1">
          <h1 className="text-[24px] sm:text-[26px] md:text-[28px] lg:text-[32px] font-bold text-slate-900 dark:text-white font-heading tracking-tight leading-tight">
            {title}
          </h1>
          {typeof count === 'number' && (
            <span className="text-fs-sm md:text-fs-base text-[var(--text-2,#A8B3C7)] font-normal tabular-nums">
              · {count} {countLabel}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-fs-base text-[var(--text-2,#A8B3C7)] max-w-2xl leading-normal">
            {subtitle}
          </p>
        )}
      </div>

      {/* Row 2: Search input + Single Filter dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
        {/* Search Input (flexible up to 640px) */}
        <div className="relative flex-1 max-w-full md:max-w-[640px]">
          <Search
            className="w-5 h-5 text-[var(--text-3,#6B7893)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder || `Search in ${title}…`}
            className="w-full h-[44px] sm:h-[48px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] focus:border-[var(--primary,#2563EB)] focus:ring-1 focus:ring-[var(--primary,#2563EB)] rounded-[12px] pl-11 pr-10 text-fs-base text-slate-900 dark:text-white placeholder-[var(--text-3,#6B7893)] outline-none transition-colors shadow-sm"
            aria-label={searchPlaceholder || `Search in ${title}`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-3,#6B7893)] hover:text-slate-900 dark:hover:text-white rounded-md transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Unified Filter Dropdown */}
        {filterGroups && filterGroups.length > 0 && (
          <div className="relative shrink-0" ref={containerRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              className="w-full sm:w-auto min-w-[180px] h-[44px] sm:h-[48px] px-4 rounded-[12px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] hover:border-[var(--primary,#2563EB)] text-fs-sm font-medium text-slate-900 dark:text-white inline-flex items-center justify-between gap-3 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary,#2563EB)]"
            >
              <span className="flex items-center gap-2 truncate">
                <SlidersHorizontal className="w-4 h-4 text-[var(--text-2,#A8B3C7)] shrink-0" />
                <span className="truncate">{summaryLabel}</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[var(--text-3,#6B7893)] transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Desktop Popover / Mobile Sheet */}
            {isOpen && (
              <>
                {/* Mobile Backdrop */}
                <div
                  className="fixed inset-0 bg-black/60 z-40 sm:hidden backdrop-blur-xs"
                  onClick={() => setIsOpen(false)}
                  aria-hidden="true"
                />

                {/* Popover / Sheet Content */}
                <div
                  className="fixed bottom-0 left-0 right-0 z-50 sm:absolute sm:bottom-auto sm:top-full sm:right-0 sm:left-auto sm:mt-2 w-full sm:w-[280px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] sm:rounded-[14px] rounded-t-[20px] p-4 shadow-2xl space-y-4 select-none max-h-[80vh] overflow-y-auto"
                  role="dialog"
                  aria-label="Filter options"
                >
                  {/* Mobile drag handle */}
                  <div className="w-10 h-1 bg-[var(--line,#1A2442)] rounded-full mx-auto sm:hidden mb-1" />

                  {/* Header in mobile */}
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--line,#1A2442)] sm:hidden">
                    <span className="text-fs-base font-bold text-slate-900 dark:text-white">
                      Filter & Sort
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="p-1 text-[var(--text-3,#6B7893)] hover:text-white rounded-md"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {filterGroups.map((group) => {
                    const activeVal = selectedFilters[group.id];
                    return (
                      <div key={group.id} className="space-y-2">
                        <div className="text-fs-xs font-semibold uppercase tracking-wider text-[var(--text-3,#6B7893)] px-1">
                          {group.label}
                        </div>
                        <div className="space-y-1">
                          {group.options.map((opt) => {
                            const isSelected = activeVal === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  onFilterChange(group.id, opt.value);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-fs-sm transition-colors text-left ${
                                  isSelected
                                    ? 'bg-[var(--primary,#2563EB)]/15 text-[var(--primary,#2563EB)] font-semibold'
                                    : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white hover:bg-[var(--card-hover,#0E182F)]'
                                }`}
                              >
                                <span>{opt.label}</span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-[var(--primary,#2563EB)]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Mobile Apply button */}
                  <div className="pt-2 border-t border-[var(--line,#1A2442)] sm:hidden">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-2.5 rounded-[10px] bg-[var(--primary,#2563EB)] hover:bg-[var(--primary-hover,#1D4ED8)] text-white text-fs-sm font-semibold transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
