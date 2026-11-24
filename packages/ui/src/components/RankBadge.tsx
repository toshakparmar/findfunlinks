import React from 'react';
import { cn } from '../utils';

export interface RankBadgeProps {
  rank: number;
  categoryName?: string;
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, categoryName, className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-fs-xs font-semibold tabular-nums',
        'bg-brand-blue-500/15 text-brand-blue-400 border border-brand-blue-500/30 dark:bg-brand-blue-600/20 dark:text-brand-blue-300',
        className,
      )}
    >
      <span>#{rank}</span>
      {categoryName && (
        <span className="font-normal opacity-80 truncate max-w-[140px]">{categoryName}</span>
      )}
    </span>
  );
};
