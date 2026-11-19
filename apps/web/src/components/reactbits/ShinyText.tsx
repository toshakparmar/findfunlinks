'use client';

import React from 'react';

interface ShinyTextProps {
  text: string;
  className?: string;
  disabled?: boolean;
  speed?: number; // in seconds
}

export function ShinyText({ text, className = '', disabled = false, speed = 5 }: ShinyTextProps) {
  if (disabled) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-gradient-to-r from-token to-token/60 animate-shiny-text ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(115deg, var(--text) 0%, var(--primary) 45%, var(--accent) 55%, var(--text) 100%)',
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
}

