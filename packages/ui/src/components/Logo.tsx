import React from 'react';
import { cn } from '../utils';

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'light' | 'dark' | 'auto';
  iconOnly?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'auto',
  iconOnly = false,
  className,
  ...props
}) => {
  const isDark = variant === 'dark';
  const isLight = variant === 'light';
  const isAuto = variant === 'auto';

  if (iconOnly) {
    return (
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('h-9 w-9 shrink-0', className)}
        role="img"
        aria-label="FindFunLinks Icon"
        {...props}
      >
        <path
          d="M28 82L10 100C7 103 7 108 10 111L11 112C14 115 19 115 22 112L40 94"
          stroke={isDark ? '#2563EB' : isLight ? '#0B57D9' : undefined}
          className={isAuto ? 'stroke-[#0B57D9] dark:stroke-[#2563EB]' : undefined}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="62"
          cy="52"
          r="42"
          stroke={isDark ? '#3B82F6' : isLight ? '#0B57D9' : undefined}
          fill={isDark ? '#0B132B' : isLight ? '#FFFFFF' : undefined}
          className={
            isAuto
              ? 'stroke-[#0B57D9] dark:stroke-[#3B82F6] fill-white dark:fill-[#0B132B]'
              : undefined
          }
          strokeWidth="12"
        />
        <circle cx="49" cy="40" r="10" fill="#F59E0B" />
        <line
          x1="49"
          y1="24"
          x2="49"
          y2="19"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="49"
          y1="56"
          x2="49"
          y2="61"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="33"
          y1="40"
          x2="28"
          y2="40"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="65"
          y1="40"
          x2="70"
          y2="40"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="38"
          y1="29"
          x2="34"
          y2="25"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="60"
          y1="51"
          x2="64"
          y2="55"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="38"
          y1="51"
          x2="34"
          y2="55"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="60"
          y1="29"
          x2="64"
          y2="25"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M54 44L77 74C73 77 66 79 59 74L50 47Z" fill="#F59E0B" opacity="0.95" />
        <path
          d="M60 78C58 71 62 67 69 63C72 67 76 69 77 74C78 78 74 81 69 81C63 81 60 79 60 78Z"
          fill="#EA580C"
        />
        <path
          d="M65 79C64 76 66 74 70 72C72 74 73 76 73 78C73 79 71 80 69 80C67 80 65 79 65 79Z"
          fill="#FFFFFF"
        />
        <line
          x1="56"
          y1="83"
          x2="82"
          y2="83"
          stroke="#EA580C"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 540 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-9 w-auto shrink-0', className)}
      role="img"
      aria-label="FindFunLinks Logo"
      {...props}
    >
      <g transform="translate(10, 10)">
        <path
          d="M26 74L8 92C5 95 5 100 8 103L9 104C12 107 17 107 20 104L38 86"
          stroke={isDark ? '#2563EB' : isLight ? '#0B57D9' : undefined}
          className={isAuto ? 'stroke-[#0B57D9] dark:stroke-[#2563EB]' : undefined}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="56"
          cy="46"
          r="38"
          stroke={isDark ? '#3B82F6' : isLight ? '#0B57D9' : undefined}
          fill={isDark ? '#0B132B' : isLight ? '#FFFFFF' : undefined}
          className={
            isAuto
              ? 'stroke-[#0B57D9] dark:stroke-[#3B82F6] fill-white dark:fill-[#0B132B]'
              : undefined
          }
          strokeWidth="11"
        />
        <circle cx="44" cy="35" r="9" fill="#F59E0B" />
        <line
          x1="44"
          y1="21"
          x2="44"
          y2="16"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="44"
          y1="49"
          x2="44"
          y2="54"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="30"
          y1="35"
          x2="25"
          y2="35"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="58"
          y1="35"
          x2="63"
          y2="35"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="34"
          y1="25"
          x2="30"
          y2="21"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="54"
          y1="45"
          x2="58"
          y2="49"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="34"
          y1="45"
          x2="30"
          y2="49"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="54"
          y1="25"
          x2="58"
          y2="21"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M49 39L69 66C66 69 60 70 54 66L45 42Z" fill="#F59E0B" opacity="0.95" />
        <path
          d="M54 70C52 64 56 60 62 56C65 60 69 62 70 66C71 70 67 73 62 73C57 73 54 71 54 70Z"
          fill="#EA580C"
        />
        <path
          d="M59 71C58 68 60 66 63 64C65 66 66 68 66 70C66 71 64 72 62 72C60 72 59 71 59 71Z"
          fill="#FFFFFF"
        />
        <line
          x1="50"
          y1="74"
          x2="74"
          y2="74"
          stroke="#EA580C"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <text
        x="130"
        y="78"
        fontFamily="var(--font-heading, 'Poppins', system-ui, sans-serif)"
        fontSize="64"
        fontWeight="800"
        fill={isDark ? '#FFFFFF' : isLight ? '#0B1220' : undefined}
        className={
          isDark
            ? 'fill-white'
            : isLight
              ? 'fill-slate-900'
              : 'fill-slate-900 dark:fill-white transition-colors'
        }
        letterSpacing="-1.5"
      >
        FindFun<tspan fill="#3B82F6">Links</tspan>
      </text>
    </svg>
  );
};
