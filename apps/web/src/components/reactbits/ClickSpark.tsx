'use client';

import React, { useState } from 'react';

interface Spark {
  id: number;
  x: number;
  y: number;
  angle: number;
}

interface ClickSparkProps {
  children: React.ReactNode;
  sparkColor?: string;
  sparkCount?: number;
  className?: string;
}

export function ClickSpark({
  children,
  sparkColor = 'var(--accent)',
  sparkCount = 8,
  className = '',
}: ClickSparkProps) {
  const [sparks, setSparks] = useState<Spark[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparks: Spark[] = Array.from({ length: sparkCount }).map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (i * 360) / sparkCount,
    }));

    setSparks(newSparks);
    setTimeout(() => setSparks([]), 600);
  };

  return (
    <div onClick={handleClick} className={`relative inline-block ${className}`}>
      {children}
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="pointer-events-none absolute w-1 h-1 rounded-full animate-ping"
          style={{
            left: `${spark.x}px`,
            top: `${spark.y}px`,
            backgroundColor: sparkColor,
            transform: `rotate(${spark.angle}deg) translate(14px)`,
          }}
        />
      ))}
    </div>
  );
}
