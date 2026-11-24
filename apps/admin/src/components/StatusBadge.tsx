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
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#0B9DF7]/15 text-[#0B9DF7] border border-[#0B9DF7]/30">
            Primary Domain
          </span>
        );
      case 'MIRROR':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
            Official Mirror
          </span>
        );
      case 'PROXY':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
            Unblock Proxy
          </span>
        );
      case 'ALTERNATE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#26292F] text-[#9CA3AF] border border-[#33373D]">
            Alternate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#26292F] text-[#9CA3AF] border border-[#33373D]">
            {status}
          </span>
        );
    }
  }

  // Domain Status or Website Status
  let colorClasses = 'bg-[#26292F] text-[#9CA3AF] border-[#33373D]';
  let dotClass = 'bg-[#6B7280]';

  if (['ACTIVE', 'APPROVED', 'RESOLVED', 'ONLINE'].includes(norm)) {
    colorClasses = 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30';
    dotClass = 'bg-[#22C55E]';
  } else if (['PENDING', 'PENDING_REVIEW', 'INVITED'].includes(norm)) {
    colorClasses = 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
    dotClass = 'bg-[#F59E0B] animate-pulse';
  } else if (['CHANGES_REQUESTED', 'REVIEW'].includes(norm)) {
    colorClasses = 'bg-[#0B9DF7]/15 text-[#0B9DF7] border-[#0B9DF7]/30';
    dotClass = 'bg-[#0B9DF7]';
  } else if (['REJECTED', 'SUSPENDED', 'DOWN', 'DISMISSED', 'OFFLINE'].includes(norm)) {
    colorClasses = 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
    dotClass = 'bg-[#EF4444]';
  } else if (['SLOW'].includes(norm)) {
    colorClasses = 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
    dotClass = 'bg-[#F59E0B]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${colorClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      <span>{status?.replace(/_/g, ' ')}</span>
    </span>
  );
}
