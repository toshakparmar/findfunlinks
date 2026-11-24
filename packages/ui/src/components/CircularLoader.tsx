'use client';

import React from 'react';

export interface CircularLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  fullPage?: boolean;
  className?: string;
  color?: string;
}

const sizeConfig = {
  xs: { dim: 18, stroke: 2.2, text: 'text-[11px]' },
  sm: { dim: 24, stroke: 2.5, text: 'text-xs' },
  md: { dim: 36, stroke: 3, text: 'text-xs' },
  lg: { dim: 56, stroke: 3.5, text: 'text-sm' },
  xl: { dim: 76, stroke: 4, text: 'text-sm' },
};

export const CircularLoader: React.FC<CircularLoaderProps> = ({
  size = 'md',
  label,
  fullPage = false,
  className = '',
  color = '#2563EB',
}) => {
  const { dim, stroke, text } = sizeConfig[size] || sizeConfig.md;
  const radius = (dim - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * 0.3; // 70% visible arc

  const loaderContent = (
    <div
      className={`inline-flex flex-col items-center justify-center gap-3 select-none ${className}`}
      role="status"
      aria-label={label || 'Loading...'}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: dim, height: dim }}
      >
        {/* Background ambient glow bloom */}
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40 transition-opacity animate-pulse pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          }}
        />

        {/* Dual-ring SVG circular loader */}
        <svg
          width={dim}
          height={dim}
          viewBox={`0 0 ${dim} ${dim}`}
          className="animate-spin relative z-10"
          style={{
            animationDuration: '0.9s',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <defs>
            <linearGradient id={`fl-spinner-grad-${dim}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
          </defs>

          {/* Background track circle */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-200 dark:text-slate-800/80"
          />

          {/* Active spinning gradient arc */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={`url(#fl-spinner-grad-${dim})`}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Optional text label underneath */}
      {label && (
        <div
          className={`font-semibold text-slate-800 dark:text-slate-300 tracking-wide flex items-center gap-1 ${text}`}
        >
          <span>{label}</span>
          <span className="inline-flex animate-pulse">...</span>
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 dark:bg-[#050A18]/70 backdrop-blur-[2px] transition-all">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};
