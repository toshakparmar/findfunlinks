'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-chip border border-token/10 bg-surface-1" />;
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isDark ? 'light' : 'dark';

    // View Transitions API circular reveal where supported
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      const transition = (document as any).startViewTransition(() => {
        setTheme(nextTheme);
      });

      transition.ready?.then(() => {
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: 400,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      });
    } else {
      setTheme(nextTheme);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-chip border border-token/10 bg-surface-1 text-token/70 hover:bg-surface-2 hover:text-token transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden"
      aria-label={isDark ? 'Switch to warm paper light mode' : 'Switch to warm ink dark mode'}
      title={isDark ? 'Switch to warm paper light mode (T)' : 'Switch to warm ink dark mode (T)'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ scale: 0.6, rotate: -45, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.6, rotate: 45, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-4 w-4 text-accent" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ scale: 0.6, rotate: 45, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.6, rotate: -45, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-4 w-4 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
