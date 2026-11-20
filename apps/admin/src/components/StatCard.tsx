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
    blue: 'bg-[#2563EB]/15 text-[#3B82F6] border-[#2563EB]/30',
    orange: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
    emerald: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
    rose: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
  };

  return (
    <div className="rounded-2xl border border-[#1A2442] bg-[#0A1226] p-5 shadow-sm space-y-3 transition-colors hover:border-[#1A2442]/80 hover:bg-[#0E182F]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#A8B3C7] uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-black text-[#F1F5F9]">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-[#A8B3C7] mt-1">
            {trend && <span className="font-semibold text-[#F1F5F9] mr-1">{trend}</span>}
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
