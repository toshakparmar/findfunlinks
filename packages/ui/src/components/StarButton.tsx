'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../utils';

export interface StarButtonProps {
  slug: string;
  count: number;
  starred?: boolean;
  size?: 'sm' | 'md';
  disabled?: boolean;
  onToggle?: (nextStarred: boolean) => Promise<{ count: number; starred: boolean } | void> | void;
  className?: string;
}

export function formatStarCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return num.toString();
}

export const StarButton: React.FC<StarButtonProps> = ({
  count: initialCount,
  starred: initialStarred = false,
  size = 'md',
  disabled = false,
  onToggle,
  className,
}) => {
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStarred(initialStarred);
    setCount(initialCount);
  }, [initialStarred, initialCount]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled || loading) return;

    const nextStarred = !starred;
    const nextCount = nextStarred ? count + 1 : Math.max(0, count - 1);

    // Optimistic UI
    setStarred(nextStarred);
    setCount(nextCount);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    if (onToggle) {
      setLoading(true);
      try {
        const result = await onToggle(nextStarred);
        if (result && typeof result.count === 'number') {
          // Safeguard: if result.count is 0 but we were unstarring a site with existing stars, use nextCount
          const finalCount = result.count === 0 && nextCount > 0 ? nextCount : result.count;
          setCount(finalCount);
          setStarred(result.starred);
        }
      } catch {
        // Revert to state before click on failure
        setStarred(starred);
        setCount(count);
      } finally {
        setLoading(false);
      }
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      role="button"
      onClick={handleClick}
      disabled={disabled || loading}
      aria-pressed={starred}
      aria-label={
        starred
          ? `Remove star. Currently ${count} stars`
          : `Star this site. Currently ${count} stars`
      }
      title={starred ? 'Remove your star' : 'Star this website'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150 select-none cursor-pointer',
        isSmall ? 'px-2 py-1 text-fs-xs' : 'px-3 py-1.5 text-fs-sm',
        starred
          ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30 dark:bg-amber-400/20 dark:text-amber-300'
          : 'bg-[var(--card,#0A1226)] text-slate-700 dark:text-[var(--text-2,#94A3B8)] border border-[var(--line,#1A2442)] hover:border-amber-400/50 hover:text-amber-500',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <Star
        className={cn(
          isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4',
          'transition-transform duration-200',
          animating && 'scale-125',
          starred ? 'fill-amber-400 text-amber-400' : 'text-slate-400 dark:text-slate-500',
        )}
      />
      <span className="tabular-nums font-semibold" title={`${count} stars`}>
        {formatStarCount(count)}
      </span>
    </button>
  );
};
