'use client';

import React from 'react';

export interface CardSkeletonProps {
  accentColor?: string;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  accentColor = '#8B5CF6',
  className = '',
}) => {
  return (
    <div
      className={`rounded-[16px] bg-[var(--card,#0A1226)] border-[1.5px] p-3.5 md:p-4 animate-pulse flex flex-col justify-between ${className}`}
      style={{
        borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
        boxShadow: `0 0 16px -6px color-mix(in srgb, ${accentColor} 25%, transparent)`,
      }}
    >
      <div>
        {/* Header skeleton */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--line,#1A2442)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[var(--line,#1A2442)]" />
            <div className="w-28 h-5 rounded bg-[var(--line,#1A2442)]" />
          </div>
          <div className="w-16 h-4 rounded-full bg-[var(--line,#1A2442)]" />
        </div>

        {/* Rows skeleton */}
        <div className="space-y-1.5 my-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-4 h-3 rounded bg-[var(--line,#1A2442)]" />
                <div className="w-5 h-5 rounded-[4px] bg-[var(--line,#1A2442)]" />
                <div className="w-32 h-3.5 rounded bg-[var(--line,#1A2442)]" />
              </div>
              <div className="w-3.5 h-3.5 rounded bg-[var(--line,#1A2442)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Button skeleton */}
      <div className="w-full h-9 rounded-[10px] bg-[var(--line,#1A2442)] mt-2" />
    </div>
  );
};
