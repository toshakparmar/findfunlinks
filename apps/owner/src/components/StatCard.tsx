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
    default: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50',
    success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
    warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
    danger: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50',
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
