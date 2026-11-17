import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  color?: 'blue' | 'orange' | 'emerald' | 'rose';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
}: StatCardProps) {
  const colorMap = {
    blue: 'bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400 border-brand-blue-500/20',
    orange:
      'bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-400 border-brand-orange-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-black text-foreground">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend && <span className="font-semibold text-foreground mr-1">{trend}</span>}
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
