'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Clock, Globe2, X } from 'lucide-react';

export function TrustShieldPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-chip text-status-online hover:bg-surface-2 transition-colors flex items-center justify-center focus:outline-none"
        title="Fleet Verification & Trust Policy"
        aria-label="Trust Policy"
      >
        <ShieldCheck className="w-5 h-5 text-status-online" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 p-4 bg-surface-1 border border-token/20 rounded-card shadow-2xl z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-token/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-status-online" />
              <span className="font-display font-bold text-sm text-token">
                Verified Mirror Fleet
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-token/40 hover:text-token transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-token/70 leading-relaxed text-fs-xs">
            Every directory entry is continuously probed by our distributed uptime workers every 60
            seconds to ensure only live, working mirrors are presented.
          </p>

          <div className="space-y-2 pt-1 font-mono text-fs-xs">
            <div className="flex items-center gap-2 text-token/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-online shrink-0" />
              <span>TLS &amp; SSL certificates actively verified</span>
            </div>
            <div className="flex items-center gap-2 text-token/80">
              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Latency tracked across 6 global edge nodes</span>
            </div>
            <div className="flex items-center gap-2 text-token/80">
              <Globe2 className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>Zero phishing or malware tolerance</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
