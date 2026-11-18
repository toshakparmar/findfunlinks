'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  Compass,
  ListFilter,
  PlusCircle,
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
  Info,
  ShieldAlert,
  FileText,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { CategoryMeta } from '../lib/directory-data';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryMeta[];
  activeCategorySlug?: string;
  onSelectCategory?: (slug: string) => void;
  viewMode?: 'cards' | 'simple';
  onToggleViewMode?: (mode: 'cards' | 'simple') => void;
  onOpenReportModal?: () => void;
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

export function Sidebar({
  isOpen,
  onClose,
  categories,
  activeCategorySlug,
  onSelectCategory,
  viewMode = 'cards',
  onToggleViewMode,
  onOpenReportModal,
}: SidebarProps) {
  const pathname = usePathname();

  const handleCategoryClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
    // Also scroll smoothly to element if on home page
    if (pathname === '/') {
      const el = document.getElementById(`category-${slug}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0e0e11] border-r border-[#222227] text-neutral-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-[#222227] bg-[#0b0b0e]">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 font-bold text-white tracking-wide text-base group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-blue-600 to-brand-orange-500 flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-sm">F</span>
            </div>
            <span>FindFunLinks</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 text-xs select-none">
          {/* Main Indexes */}
          <div>
            <ul className="space-y-0.5 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleViewMode) onToggleViewMode('cards');
                    if (pathname !== '/') window.location.href = '/';
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                    viewMode === 'cards' && pathname === '/'
                      ? 'bg-[#1e1e24] text-white font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-[#16161b]'
                  }`}
                >
                  <Compass className="w-4 h-4 text-blue-400" />
                  <span>Main Index</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleViewMode) onToggleViewMode('simple');
                    if (pathname !== '/') window.location.href = '/';
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                    viewMode === 'simple' && pathname === '/'
                      ? 'bg-[#1e1e24] text-white font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-[#16161b]'
                  }`}
                >
                  <ListFilter className="w-4 h-4 text-amber-400" />
                  <span>Simple Index</span>
                </button>
              </li>
              <li>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-[#16161b] transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>Submit Website</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Sections (Categories) */}
          <div>
            <div className="px-2.5 pb-1 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Sections
            </div>
            <ul className="space-y-0.5">
              {categories.map((cat) => {
                const IconComponent = (cat.iconName && CATEGORY_ICONS[cat.iconName]) || Compass;
                const isSelected = activeCategorySlug === cat.slug;
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-all ${
                        isSelected
                          ? 'bg-[#1d1d24] text-white font-semibold shadow-inner'
                          : 'text-neutral-400 hover:text-white hover:bg-[#15151a]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <IconComponent
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: cat.themeColor || '#60a5fa' }}
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      {cat.count !== undefined && (
                        <span className="text-[10px] text-neutral-500 tabular-nums">
                          {cat.count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Pages */}
          <div>
            <div className="px-2.5 pb-1 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Pages
            </div>
            <ul className="space-y-0.5 text-neutral-400 font-medium">
              <li>
                <Link
                  href="/about"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:text-white hover:bg-[#15151a] transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>About & FAQ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dmca"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:text-white hover:bg-[#15151a] transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>DMCA Notice</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:text-white hover:bg-[#15151a] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:text-white hover:bg-[#15151a] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              {onOpenReportModal && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenReportModal();
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left text-neutral-400 hover:text-amber-400 hover:bg-[#15151a] transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Report Broken Link</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#222227] bg-[#0a0a0d] text-[11px] text-neutral-500 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              99.8% Fleet Active
            </span>
            <span className="text-neutral-600">v2.0</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-[10px]">
            <span>© 2026 FindFunLinks</span>
            <a
              href="https://findfunlinks.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-300 inline-flex items-center gap-0.5"
            >
              findfunlinks.com <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
