import React from 'react';
import { CircularLoader } from '../../../components/ui/CircularLoader';

export default function WebsiteLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-[#0B132B] rounded-md border border-[#1A2442]" />

      {/* Hero Card Skeleton */}
      <div className="rounded-3xl border border-[#1A2442] bg-[#070D1E] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5 w-full">
            {/* Logo skeleton */}
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#0B132B] border border-[#1A2442] shrink-0" />

            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="h-7 sm:h-8 w-44 bg-[#0B132B] rounded-lg" />
                <div className="h-5 w-24 bg-[#0B132B] rounded-full" />
              </div>
              <div className="h-4 w-3/4 max-w-md bg-[#0B132B] rounded" />
              <div className="flex gap-3 pt-1">
                <div className="h-4 w-28 bg-[#0B132B] rounded" />
                <div className="h-4 w-24 bg-[#0B132B] rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Highlights skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-[#1A2442]">
          <div className="h-10 bg-[#0B132B]/80 rounded-xl border border-[#1A2442]" />
          <div className="h-10 bg-[#0B132B]/80 rounded-xl border border-[#1A2442]" />
          <div className="h-10 bg-[#0B132B]/80 rounded-xl border border-[#1A2442]" />
          <div className="h-10 bg-[#0B132B]/80 rounded-xl border border-[#1A2442]" />
        </div>

        {/* CTA Bar skeleton */}
        <div className="pt-6 border-t border-[#1A2442] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="h-8 w-64 bg-[#0B132B] rounded-lg" />
          <div className="h-11 w-44 bg-[#0B132B] rounded-xl" />
        </div>
      </div>

      {/* Central Spinner & Status */}
      <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
        <CircularLoader size="lg" label="Loading verified website details..." />
        <p className="text-xs text-[#9CA3AF]">
          Fetching real-time mirror telemetry and working domain endpoints...
        </p>
      </div>
    </div>
  );
}
