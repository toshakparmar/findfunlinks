'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}: StatCardProps) {
  const variantStyles = {
    default: 'text-[#3B82F6] bg-[#2563EB]/15 border-[#2563EB]/30',
    success: 'text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/30',
    warning: 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30',
    danger: 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/30',
  };

  return (
    <div className="bg-[#0A1226] rounded-2xl border border-[#1A2442] p-5 shadow-sm space-y-3 hover:bg-[#0E182F] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#A8B3C7] uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${variantStyles[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <p className="text-2xl font-black text-[#F1F5F9]">{value}</p>
        {subtitle && <p className="text-xs text-[#A8B3C7] mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
