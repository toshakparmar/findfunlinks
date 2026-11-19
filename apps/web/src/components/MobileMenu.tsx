'use client';

import React from 'react';
import Link from 'next/link';
import { X, Sun, Moon, ShieldAlert, FileText, Info, PlusCircle } from 'lucide-react';
import { Logo } from '@findfunlinks/ui';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  currentTheme = 'dark',
  onToggleTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs h-full bg-[var(--header,#070D1E)] border-r border-[var(--line,#1A2442)] p-4 flex flex-col justify-between z-10 overflow-y-auto animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--line,#1A2442)] mb-4">
            <Link href="/" onClick={onClose}>
              <Logo variant="auto" className="h-7 w-auto" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            {/* Mobile Registration CTA Button */}
            <Link
              href="/register"
              onClick={() => {
                onClose();
                if (typeof window !== 'undefined' && (window as any).va) {
                  (window as any).va('event', {
                    name: 'cta_register_click',
                    data: { source: 'mobile_menu' },
                  });
                }
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-[var(--primary,#2563EB)] hover:bg-[var(--primary-hover,#1D4ED8)] text-white shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Website</span>
            </Link>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[var(--text-3,#6B7893)] uppercase tracking-wider px-2">
                Navigation
              </span>
              <Link
                href="/"
                onClick={onClose}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-900 dark:text-white hover:bg-[var(--card-hover,#0E182F)] transition-colors"
              >
                Home
              </Link>
              <Link
                href="/categories"
                onClick={onClose}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white hover:bg-[var(--card-hover,#0E182F)] transition-colors"
              >
                All Categories
              </Link>
              <Link
                href="/new"
                onClick={onClose}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white hover:bg-[var(--card-hover,#0E182F)] transition-colors"
              >
                New Additions
              </Link>
              <Link
                href="/popular"
                onClick={onClose}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white hover:bg-[var(--card-hover,#0E182F)] transition-colors"
              >
                Popular Websites
              </Link>
              <Link
                href="/requests"
                onClick={onClose}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white hover:bg-[var(--card-hover,#0E182F)] transition-colors"
              >
                Website Requests
              </Link>
            </div>

            <div className="space-y-1 pt-3 border-t border-[var(--line,#1A2442)]">
              <span className="text-[11px] font-semibold text-[var(--text-3,#6B7893)] uppercase tracking-wider px-2">
                Information & Legal
              </span>
              <Link
                href="/about"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white hover:bg-[var(--card-hover,#0E182F)] transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span>About</span>
              </Link>
              <Link
                href="/dmca"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white hover:bg-[var(--card-hover,#0E182F)] transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>DMCA Notice</span>
              </Link>
              <Link
                href="/privacy"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white hover:bg-[var(--card-hover,#0E182F)] transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Privacy Policy</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer with Theme Toggle */}
        <div className="pt-4 border-t border-[var(--line,#1A2442)]">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] text-xs font-medium text-slate-900 dark:text-white"
            >
              <span>Theme</span>
              <div className="flex items-center gap-1.5 text-[var(--text-2,#A8B3C7)]">
                {currentTheme === 'dark' ? (
                  <>
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </>
                )}
              </div>
            </button>
          )}

          <div className="mt-4 text-[10px] text-[var(--text-3,#6B7893)] text-center">
            FindFunLinks v2.0
          </div>
        </div>
      </div>
    </div>
  );
};
