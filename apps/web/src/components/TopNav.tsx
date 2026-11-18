'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Search, X, PlusCircle, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CategoryMeta } from '../lib/directory-data';

interface TopNavProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categories: CategoryMeta[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function TopNav({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-3 sm:px-5 bg-[#0e0e11]/90 backdrop-blur-md border-b border-[#222227] text-neutral-200">
      {/* Left Section: Menu Toggle & Mobile Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#18181e] transition-colors focus:outline-none"
          aria-label="Toggle sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-white tracking-wide lg:hidden"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-brand-blue-600 to-brand-orange-500 flex items-center justify-center">
            <span className="text-white font-black text-xs">F</span>
          </div>
          <span className="text-sm">FindFunLinks</span>
        </Link>
      </div>

      {/* Center Section: Compact Search Bar & Filter */}
      <div className="flex-1 max-w-lg mx-3 sm:mx-6">
        <div className="flex items-center w-full h-9 bg-[#15151a] border border-[#2b2b33] rounded-md focus-within:border-brand-blue-500 focus-within:ring-1 focus-within:ring-brand-blue-500/50 transition-all">
          <div className="pl-3 pr-1 text-neutral-500 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="website name..."
            className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none px-1"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-1 mr-1 text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Inline Category Select Filter */}
          <div className="relative border-l border-[#27272f]">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="appearance-none bg-transparent text-[11px] font-medium text-neutral-400 hover:text-neutral-200 focus:outline-none pl-2.5 pr-6 py-1 cursor-pointer"
            >
              <option value="all" className="bg-[#15151a] text-white">
                Any
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug} className="bg-[#15151a] text-white">
                  {c.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-neutral-500">
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Submit button, Theme Toggle & Admin Shortcut */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          href="/register"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-medium text-xs shadow-sm hover:shadow transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Submit</span>
        </Link>

        <ThemeToggle />

        <a
          href="http://localhost:3001"
          target="_blank"
          rel="noopener noreferrer"
          title="Super Admin Portal"
          className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-[#18181e] transition-colors"
        >
          <ShieldCheck className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
}
