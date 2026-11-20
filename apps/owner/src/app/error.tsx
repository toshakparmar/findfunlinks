'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error to console
    console.error('Owner Portal Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050A18] text-[#F1F5F9] relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#EF4444]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 text-center space-y-6">
        <div className="bg-[#0A1226]/90 backdrop-blur-xl rounded-3xl border border-[#1A2442] p-8 shadow-2xl space-y-6">
          <div className="relative w-12 h-12 mx-auto">
            <Image
              src="/logo-mark.svg"
              alt="FindFunLinks"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Portal Error</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">
              Something went wrong
            </h1>
            <p className="text-xs text-[#A8B3C7] max-w-xs mx-auto leading-relaxed">
              An unexpected error occurred while loading this view. You can reload or return to the
              dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-[#2563EB]/25 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#1A2442] bg-[#070D1E] hover:bg-[#0E182F] text-[#F1F5F9] text-xs font-semibold transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-[#3B82F6]" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
