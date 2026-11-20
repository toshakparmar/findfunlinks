import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase() || 'UNKNOWN';

  let colorClasses = 'bg-[#1A2442] text-[#A8B3C7] border-[#1A2442]';
  let dotClass = 'bg-[#6B7893]';

  if (['ACTIVE', 'APPROVED', 'RESOLVED', 'ONLINE'].includes(s)) {
    colorClasses = 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30';
    dotClass = 'bg-[#22C55E] shadow-sm shadow-[#22C55E]/50';
  } else if (['PENDING', 'PENDING_REVIEW', 'INVITED'].includes(s)) {
    colorClasses = 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
    dotClass = 'bg-[#F59E0B] animate-pulse';
  } else if (['CHANGES_REQUESTED', 'REVIEW'].includes(s)) {
    colorClasses = 'bg-[#2563EB]/15 text-[#3B82F6] border-[#2563EB]/30';
    dotClass = 'bg-[#3B82F6]';
  } else if (['REJECTED', 'SUSPENDED', 'DOWN', 'DISMISSED', 'OFFLINE'].includes(s)) {
    colorClasses = 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
    dotClass = 'bg-[#EF4444]';
  } else if (['SLOW'].includes(s)) {
    colorClasses = 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
    dotClass = 'bg-[#F59E0B]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colorClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      <span>{status?.replace(/_/g, ' ')}</span>
    </span>
  );
}
