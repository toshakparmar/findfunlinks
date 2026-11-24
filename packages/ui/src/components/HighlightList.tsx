import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../utils';

export interface HighlightListProps {
  highlights: string[];
  maxCount?: number;
  accentColor?: string;
  detailUrl?: string;
  totalCount?: number;
  className?: string;
}

export const HighlightList: React.FC<HighlightListProps> = ({
  highlights,
  maxCount = 6,
  accentColor = '#2563EB',
  detailUrl,
  totalCount,
  className,
}) => {
  if (!highlights || highlights.length === 0) return null;

  const displayList = highlights.slice(0, maxCount);
  const remainingCount = (totalCount ?? highlights.length) - displayList.length;

  return (
    <div className={cn('space-y-1.5', className)}>
      <ul className="space-y-1.5" role="list">
        {displayList.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-fs-sm leading-relaxed text-slate-700 dark:text-[var(--text,#F1F5F9)]">
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full shrink-0 mt-0.5"
              style={{
                backgroundColor: `color-mix(in srgb, ${accentColor} 18%, transparent)`,
                color: accentColor,
              }}
              aria-hidden="true"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </span>
            <span className="break-words">{item}</span>
          </li>
        ))}
      </ul>

      {remainingCount > 0 && detailUrl && (
        <div className="pt-1">
          <a
            href={detailUrl}
            className="text-fs-xs font-semibold hover:underline inline-flex items-center gap-1"
            style={{ color: accentColor }}
          >
            +{remainingCount} more highlights &rarr;
          </a>
        </div>
      )}
    </div>
  );
};
