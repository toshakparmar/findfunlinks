'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100);
      }

      setIsVisible(currentScroll > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  // SVG circle calculations for 40px circle with r=16
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        type="button"
        onClick={scrollToTop}
        className="relative w-11 h-11 rounded-full bg-surface-1 border border-token/20 shadow-warm-lg flex items-center justify-center text-token hover:text-primary transition-all hover:scale-105 active:scale-95 group focus:outline-none"
        aria-label="Scroll back to top"
      >
        {/* Circular Progress Ring */}
        <svg className="w-full h-full -rotate-90 pointer-events-none absolute inset-0" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="transparent"
            stroke="var(--border)"
            strokeWidth="2.5"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="transparent"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-150"
          />
        </svg>

        <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}
