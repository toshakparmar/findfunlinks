'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { CircularLoader } from './ui/CircularLoader';

export function GlobalNavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, setNavigating] = useState(false);

  // Intercept client-side link clicks to display immediate top loader
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('/#') &&
        !target.getAttribute('target') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        if (href !== pathname) {
          setNavigating(true);
        }
      }
    };

    window.addEventListener('click', handleAnchorClick, { capture: true });
    return () => window.removeEventListener('click', handleAnchorClick, { capture: true });
  }, [pathname]);

  // Turn off loading once pathname or searchParams finish updating
  useEffect(() => {
    setNavigating(false);
  }, [pathname, searchParams]);

  if (!navigating) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 dark:bg-[#050A18]/70 backdrop-blur-[2px] pointer-events-auto transition-all animate-fade-in">
      <CircularLoader size="xl" label="Loading" />
    </div>
  );
}
