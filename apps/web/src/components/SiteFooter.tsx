'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@findfunlinks/ui';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[var(--header,#070D1E)] border-t border-[var(--line,#1A2442)] py-8 px-4 lg:px-8 mt-12 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Logo & Tagline */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <Link href="/" className="inline-block">
            <Logo variant="auto" className="h-7 w-auto" />
          </Link>
          <p className="text-xs text-[var(--text-3,#6B7893)] font-medium text-center md:text-left mt-1">
            Your Hub for Movies, Shows, OTT, Anime and More.
          </p>
        </div>

        {/* Right: Policy & Info Links (Contact and FAQ explicitly removed per specification) */}
        <nav className="flex items-center flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-[var(--text-2,#A8B3C7)]">
          <Link
            href="/about"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            About
          </Link>
          <Link
            href="/dmca"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            DMCA
          </Link>
          <Link
            href="/privacy"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/register"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).va) {
                (window as any).va('event', {
                  name: 'cta_register_click',
                  data: { source: 'footer' },
                });
              }
            }}
            className="text-[var(--primary,#2563EB)] hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
          >
            List your website
          </Link>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-[var(--line,#1A2442)]/60 text-center text-[11px] text-[var(--text-3,#6B7893)]">
        © {new Date().getFullYear()} FindFunLinks. All trademarks and logos belong to their
        respective owners.
      </div>
    </footer>
  );
};
