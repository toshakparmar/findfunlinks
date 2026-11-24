'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Compass, HelpCircle } from 'lucide-react';
import { Logo } from '@finallinks/ui';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 text-token relative overflow-hidden select-none">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 text-center space-y-6">
        <div className="bg-surface-1/90 backdrop-blur-xl rounded-3xl border border-token/10 p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-hot/10 text-hot border border-hot/25 text-fs-sm font-bold uppercase tracking-wider">
            <HelpCircle className="h-4 w-4" />
            <span>404 Not Found</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black font-display text-token tracking-tight">
              Page Not Found
            </h1>
            <p className="text-fs-sm text-token/70 max-w-sm mx-auto leading-relaxed">
              The page or category you are looking for does not exist or has been relocated in our
              directory.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-fg text-fs-sm font-bold shadow-md transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Back to Directory</span>
            </Link>
            <Link
              href="/categories"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-token/15 bg-surface-2 hover:bg-surface-2/80 text-token text-fs-sm font-semibold transition-colors"
            >
              <Compass className="w-4 h-4 text-primary" />
              <span>Browse Categories</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
