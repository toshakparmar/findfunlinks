import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  subtitle?: string; // alias for description
  trend?: string;
  color?: 'blue' | 'orange' | 'emerald' | 'rose';
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  subtitle,
  trend,
  color = 'blue',
  variant,
}: StatCardProps) {
  let effectiveColor = color;
  if (variant === 'success') effectiveColor = 'emerald';
  else if (variant === 'danger') effectiveColor = 'rose';
  else if (variant === 'warning') effectiveColor = 'orange';

  const colorMap = {
    blue: 'bg-[#0B9DF7]/15 text-[#0B9DF7] border-[#0B9DF7]/30',
    orange: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
    emerald: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
    rose: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
  };

  const descText = description || subtitle;

  return (
    <div className="rounded-xl border border-[#33373D] bg-[#1E2024] p-5 shadow-sm space-y-3 transition-colors hover:border-[#4B5563] hover:bg-[#26292F]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg border ${colorMap[effectiveColor]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div>
        <div className="text-3xl font-bold text-[#F3F4F6] tracking-tight">{value}</div>
        {(descText || trend) && (
          <p className="text-xs text-[#9CA3AF] mt-1.5 flex items-center gap-1.5">
            {trend && <span className="font-semibold text-[#F3F4F6]">{trend}</span>}
            <span>{descText}</span>
          </p>
        )}
      </div>
    </div>
  );
}
