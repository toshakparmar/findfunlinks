'use client';

import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K  /  ⌘ + K', desc: 'Open Command Palette' },
    { key: '/', desc: 'Quick focus search field' },
    { key: 't', desc: 'Toggle Dark / Light theme' },
    { key: '?', desc: 'Open keyboard shortcuts cheatsheet' },
    { key: 'Esc', desc: 'Close open modal or menu' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-surface-1 border border-token/20 rounded-card shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-token/10">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-accent" />
            <h3 className="font-display font-semibold text-sm text-token">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-token/40 hover:text-token transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-token/5 text-xs">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2.5">
              <span className="text-token/70">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-surface-2 border border-token/15 font-mono text-[11px] text-token font-medium">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-[11px] text-token/40 font-mono">
          Press <kbd className="px-1 py-0.5 rounded bg-surface-2 border border-token/15">ESC</kbd> to dismiss
        </div>
      </div>
    </div>
  );
}

