import React from 'react';
import { cn } from '../utils';

export interface NewBadgeProps {
  className?: string;
}

export const NewBadge: React.FC<NewBadgeProps> = ({ className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase leading-none shrink-0',
        'bg-amber-500/20 text-amber-500 border border-amber-500/40 dark:bg-amber-400/15 dark:text-amber-400 dark:border-amber-400/30',
        className,
      )}
      title="Added within the last 14 days"
    >
      NEW
    </span>
  );
};
