'use client';

import React, { useState } from 'react';
import { WebsiteCardData } from './DirectoryCard';

interface HoverPreviewCardProps {
  site: WebsiteCardData;
  children: React.ReactNode;
}

export function HoverPreviewCard({ site, children }: HoverPreviewCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}

      {isOpen && (
        <div className="hidden lg:block absolute left-0 bottom-full mb-2 z-40 w-64 p-3 bg-surface-1 border border-token/20 rounded-card shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-6 h-6 rounded-chip bg-surface-2 border border-token/10 flex items-center justify-center font-bold text-xs shrink-0">
              {site.name.charAt(0)}
            </div>
            <div className="truncate">
              <span className="font-semibold text-token text-xs block truncate">{site.name}</span>
              <span className="text-[10px] text-token/40 font-mono block">
                {site.categoryName}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-token/70 leading-relaxed line-clamp-2 mb-2.5">
            {site.tagline || site.description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-token/10 text-[10px] font-mono">
            <span className="text-status-online flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-online" />
              Verified Active
            </span>
            <span className="text-token/50">{site.domains?.length || 1} live mirrors</span>
          </div>
        </div>
      )}
    </div>
  );
}

