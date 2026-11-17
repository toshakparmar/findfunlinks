import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase() || 'UNKNOWN';

  let colorClasses = 'bg-muted text-muted-foreground border-border';
  let dotClass = 'bg-muted-foreground';

  if (['ACTIVE', 'APPROVED', 'RESOLVED'].includes(s)) {
    colorClasses = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    dotClass = 'bg-emerald-500';
  } else if (['PENDING', 'PENDING_REVIEW'].includes(s)) {
    colorClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    dotClass = 'bg-amber-500 animate-pulse';
  } else if (['CHANGES_REQUESTED'].includes(s)) {
    colorClasses =
      'bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400 border-brand-blue-500/20';
    dotClass = 'bg-brand-blue-500';
  } else if (['REJECTED', 'SUSPENDED', 'DOWN', 'DISMISSED'].includes(s)) {
    colorClasses = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    dotClass = 'bg-rose-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      <span>{status}</span>
    </span>
  );
}
