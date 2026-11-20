'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'domainType';
}

export function StatusBadge({ status, type = 'status' }: StatusBadgeProps) {
  const norm = (status || '').toUpperCase();

  if (type === 'domainType') {
    switch (norm) {
      case 'PRIMARY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#2563EB]/15 text-[#3B82F6] border border-[#2563EB]/30">
            Primary Domain
          </span>
        );
      case 'MIRROR':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
            Official Mirror
          </span>
        );
      case 'PROXY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/30">
            Unblock Proxy
          </span>
        );
      case 'ALTERNATE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#1A2442] text-[#A8B3C7] border border-[#1A2442]">
            Alternate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#1A2442] text-[#A8B3C7]">
            {status}
          </span>
        );
    }
  }

  // Domain Status or Website Status
  switch (norm) {
    case 'ACTIVE':
    case 'ONLINE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-sm shadow-[#22C55E]/50" />
          Active
        </span>
      );
    case 'DOWN':
    case 'OFFLINE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          Offline / Down
        </span>
      );
    case 'SLOW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          Slow Latency
        </span>
      );
    case 'BLOCKED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          DNS Blocked
        </span>
      );
    case 'PENDING':
    case 'PENDING_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
          Pending Verification
        </span>
      );
    case 'SUSPENDED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          Suspended
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1A2442] text-[#A8B3C7] border border-[#1A2442]">
          Archived
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#1A2442] text-[#A8B3C7]">
          {status}
        </span>
      );
  }
}
