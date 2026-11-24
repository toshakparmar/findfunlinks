'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Search, X, ArrowUpRight, HelpCircle } from 'lucide-react';
import { Logo } from '@finallinks/ui';
import { ThemeToggle } from './ThemeToggle';
import { TrustShieldPopover } from './TrustShieldPopover';
import { Magnet } from './reactbits/Magnet';
import { ShinyText } from './reactbits/ShinyText';
import { CategoryMeta } from '../lib/directory-data';

interface TopNavProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categories: CategoryMeta[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcuts?: () => void;
}

export function TopNav({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenCommandPalette,
  onOpenShortcuts,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-3 sm:px-5 bg-surface-1/90 backdrop-blur-md border-b border-token/10 text-token">
      {/* Left Section: Menu Toggle & Mobile Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-chip text-token/60 hover:text-token hover:bg-surface-2 transition-colors focus:outline-none"
          aria-label="Toggle sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 font-display font-bold text-token tracking-tight lg:hidden"
        >
          <Logo variant="mark" size="sm" className="w-6 h-6 shrink-0" />
          <span className="text-sm">FinalLinks</span>
        </Link>
      </div>

      {/* Center Section: Compact Search Bar & Filter with Command Palette trigger */}
      <div className="flex-1 max-w-lg mx-3 sm:mx-6">
        <div className="flex items-center w-full h-9 bg-surface-2 border border-token/15 rounded-chip focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40 transition-all shadow-subtle">
          <div className="pl-3 pr-1 text-token/40 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="website name..."
            className="w-full bg-transparent text-xs text-token placeholder:text-token/40 focus:outline-none px-1.5"
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-1 mr-1 text-token/40 hover:text-token transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            onOpenCommandPalette && (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="hidden sm:flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded bg-surface-1 border border-token/15 text-fs-xs font-mono text-token/50 hover:text-token hover:border-token/30 transition-all"
                title="Open Command Palette (Ctrl+K)"
              >
                <span>⌘K</span>
              </button>
            )
          )}

          {/* Meaningful Status / Category Filter */}
          <div className="relative border-l border-token/10">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="appearance-none bg-transparent text-fs-xs font-medium text-token/60 hover:text-token focus:outline-none pl-2.5 pr-6 py-1 cursor-pointer"
            >
              <option value="all" className="bg-surface-1 text-token">
                All Status
              </option>
              <option value="online" className="bg-surface-1 text-token">
                Online Only
              </option>
              <option value="mirrors" className="bg-surface-1 text-token">
                Has Mirrors
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug} className="bg-surface-1 text-token">
                  {c.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-token/40">
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Submit button, Theme Toggle, Trust Shield, Shortcuts */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Keyboard shortcut guide */}
        {onOpenShortcuts && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="hidden sm:flex p-1.5 rounded-chip text-token/40 hover:text-token hover:bg-surface-2 transition-colors"
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        {/* Trust Shield with verified fleet popover */}
        <TrustShieldPopover />

        {/* Theme Toggle (Sun ↔ Moon morph) */}
        <ThemeToggle />

        {/* Submit Primary CTA with Magnetic Hover & Arrow Micro-animation */}
        <Magnet distance={20}>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip bg-primary hover:opacity-95 text-primary-fg font-medium text-xs shadow-warm transition-all group active:scale-95"
          >
            <ShinyText text="Submit" speed={6} className="font-semibold text-white" />
            <ArrowUpRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </Magnet>
      </div>
    </header>
  );
}
