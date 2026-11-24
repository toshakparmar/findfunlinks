import React from 'react';
import { BRAND } from '@finallinks/config';
import { cn } from '../utils';

export interface LogoProps extends Omit<React.SVGProps<SVGSVGElement>, 'size'> {
  variant?: 'full' | 'mark' | 'auto' | 'light' | 'dark'; // 'auto' | 'light' | 'dark' supported for backwards compatibility
  theme?: 'auto' | 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | number;
  iconOnly?: boolean; // backwards-compatible alias for variant="mark"
  className?: string;
  priority?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'auto',
  size = 'md',
  iconOnly,
  className,
  priority: _priority,
  style,
  ...props
}) => {
  // Normalize variant and theme for backward compatibility
  const resolvedVariant: 'full' | 'mark' =
    iconOnly || variant === 'mark'
      ? 'mark'
      : 'full';

  const resolvedTheme: 'auto' | 'dark' | 'light' =
    variant === 'dark' || variant === 'light' || variant === 'auto'
      ? variant
      : theme;

  const isMark = resolvedVariant === 'mark';
  const isDark = resolvedTheme === 'dark';
  const isLight = resolvedTheme === 'light';

  // Height mappings
  const heightClass =
    typeof size === 'string'
      ? size === 'sm'
        ? 'h-6'
        : size === 'lg'
          ? 'h-10'
          : 'h-8'
      : undefined;

  const dynamicStyle: React.CSSProperties = {
    ...(typeof size === 'number' ? { height: `${size}px` } : {}),
    ...style,
  };

  if (isMark) {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(heightClass, 'w-auto shrink-0', className)}
        style={dynamicStyle}
        role="img"
        aria-label={BRAND.name}
        {...props}
      >
        <path
          d="M52 40L66 26C71.5228 20.4772 80.4772 20.4772 86 26C91.5228 31.5228 91.5228 40.4772 86 46L72 60C66.4772 65.5228 57.5228 65.5228 52 60"
          stroke={isDark ? '#0B9DF7' : isLight ? '#0A8FE0' : undefined}
          className="stroke-[#0A8FE0] dark:stroke-[#0B9DF7]"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M48 60L34 74C28.4772 79.5228 19.5228 79.5228 14 74C8.47715 68.4772 8.47715 59.5228 14 54L28 40C33.5228 34.4772 42.4772 34.4772 48 40"
          stroke={isDark ? '#0B9DF7' : isLight ? '#0A8FE0' : undefined}
          className="stroke-[#0A8FE0] dark:stroke-[#0B9DF7]"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="39"
          y1="61"
          x2="61"
          y2="39"
          stroke={isDark ? '#0B9DF7' : isLight ? '#0A8FE0' : undefined}
          className="stroke-[#0A8FE0] dark:stroke-[#0B9DF7]"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Full variant: Chain mark + two-tone wordmark
  return (
    <svg
      viewBox="0 0 420 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(heightClass, 'w-auto shrink-0', className)}
      style={dynamicStyle}
      role="img"
      aria-label={BRAND.name}
      {...props}
    >
      <g transform="translate(4, 0)">
        <path
          d="M52 40L66 26C71.5228 20.4772 80.4772 20.4772 86 26C91.5228 31.5228 91.5228 40.4772 86 46L72 60C66.4772 65.5228 57.5228 65.5228 52 60"
          stroke={isDark ? '#0B9DF7' : isLight ? '#0A8FE0' : undefined}
          className="stroke-[#0A8FE0] dark:stroke-[#0B9DF7]"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M48 60L34 74C28.4772 79.5228 19.5228 79.5228 14 74C8.47715 68.4772 8.47715 59.5228 14 54L28 40C33.5228 34.4772 42.4772 34.4772 48 40"
          stroke={isDark ? '#0B9DF7' : isLight ? '#0A8FE0' : undefined}
          className="stroke-[#0A8FE0] dark:stroke-[#0B9DF7]"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="39"
          y1="61"
          x2="61"
          y2="39"
          stroke={isDark ? '#0B9DF7' : isLight ? '#0A8FE0' : undefined}
          className="stroke-[#0A8FE0] dark:stroke-[#0B9DF7]"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
      <text
        x="116"
        y="68"
        fontFamily="var(--font-heading, system-ui, -apple-system, sans-serif)"
        fontSize="54"
        fontWeight="800"
        fill={isDark ? '#FFFFFF' : isLight ? '#0F172A' : undefined}
        className={
          isDark
            ? 'fill-white'
            : isLight
              ? 'fill-[#0F172A]'
              : 'fill-[#0F172A] dark:fill-white transition-colors'
        }
        letterSpacing="-1.5"
      >
        {BRAND.wordmark.first}
        <tspan
          fill={isDark ? '#0B9DF7' : isLight ? '#0A8FE0' : undefined}
          className="fill-[#0A8FE0] dark:fill-[#0B9DF7]"
        >
          {BRAND.wordmark.second}
        </tspan>
      </text>
    </svg>
  );
};
