'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { CircularLoader } from './ui/CircularLoader';

export interface ViewMoreButtonProps {
  href: string;
  accentColor?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export const ViewMoreButton: React.FC<ViewMoreButtonProps> = ({
  href,
  accentColor = '#3B82F6',
  label = 'View All',
  onClick,
  className = '',
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Strip any accidental arrow characters passed in the label (Section 3.3 fix)
  const cleanLabel = label.replace(/[→\->\u2192]+/g, '').trim() || 'View All';

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
    if (e.defaultPrevented) return;

    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-busy={isPending}
      className={`group relative w-full py-2 sm:py-2.5 px-3 rounded-[8px] sm:rounded-[10px] text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-center gap-1.5 overflow-hidden transition-all duration-200 mt-2 bg-[var(--card,#0A1226)] hover:brightness-105 dark:hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring,rgba(59,130,246,0.6))] select-none cursor-pointer ${className}`}
      style={{
        border: `1.5px solid ${accentColor}`,
        boxShadow: `0 0 12px -4px color-mix(in srgb, ${accentColor} 40%, transparent)`,
      }}
    >
      {/* Accent fill from left on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out -z-0 pointer-events-none"
        style={{
          background: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
        }}
      />

      <span className="relative z-10">{cleanLabel}</span>

      {isPending ? (
        <CircularLoader size="xs" color={accentColor} />
      ) : (
        <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 motion-reduce:transform-none" />
      )}
    </a>
  );
};
