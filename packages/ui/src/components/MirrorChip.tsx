'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { cn } from '../utils';

export interface MirrorChipProps {
  id: string;
  label?: string | null;
  url: string;
  type?: string;
  status?: string;
  responseMs?: number | null;
  accentColor?: string;
  className?: string;
  onOpen?: (url: string) => void;
}

export const MirrorChip: React.FC<MirrorChipProps> = ({
  label,
  url,
  type: _type,
  status = 'ACTIVE',
  responseMs,
  accentColor = '#2563EB',
  className,
  onOpen,
}) => {
  const [copied, setCopied] = useState(false);

  const displayLabel = label || (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  const isActive = status === 'ACTIVE';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onOpen) {
      e.preventDefault();
      onOpen(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      className={cn(
        'group/chip relative w-full flex items-center justify-between min-h-[42px] px-3 py-2 rounded-xl text-left cursor-pointer transition-all duration-150 select-none',
        'bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] hover:border-[var(--primary,#2563EB)] active:scale-[0.99]',
        className,
      )}
      style={{
        outlineColor: accentColor,
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0 mr-2">
        {/* Status dot */}
        <span
          className={cn(
            'w-2 h-2 rounded-full shrink-0',
            isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500',
          )}
          title={`Status: ${status}`}
          aria-label={`Status ${status}`}
        />

        {/* Label */}
        <span className="truncate font-medium text-fs-sm text-slate-800 dark:text-[var(--text,#F1F5F9)] group-hover/chip:text-brand-blue-400 transition-colors">
          {displayLabel}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Latency metric if available */}
        {responseMs != null && responseMs > 0 && (
          <span
            className={cn(
              'text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded border',
              responseMs < 150
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : responseMs < 400
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
            )}
          >
            {responseMs}ms
          </span>
        )}

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied link' : 'Copy link to clipboard'}
          className="p-1 rounded text-[var(--text-3,#6B7893)] hover:text-white hover:bg-slate-800 transition-colors opacity-70 group-hover/chip:opacity-100"
          title="Copy URL"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {/* External Link icon */}
        <ExternalLink className="w-3.5 h-3.5 text-[var(--text-3,#6B7893)] group-hover/chip:text-brand-blue-400 group-hover/chip:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
};
