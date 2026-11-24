'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../utils';

export interface BackToTopProps {
  threshold?: number;
  className?: string;
}

export const BackToTop: React.FC<BackToTopProps> = ({ threshold = 500, className }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Back to top"
      className={cn(
        'fixed bottom-20 md:bottom-8 right-6 z-40 p-2.5 rounded-full shadow-lg transition-all duration-200 cursor-pointer',
        'bg-[var(--card,#0A1226)] text-[var(--text,#F1F5F9)] border border-[var(--line,#1A2442)] hover:border-brand-blue-500 hover:text-brand-blue-400 hover:scale-110 active:scale-95',
        className,
      )}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
