'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  name?: string;
  id?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  size = 'md',
  disabled = false,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'ArrowDown' && isOpen && options.length > 0) {
      e.preventDefault();
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const nextIndex = (currentIndex + 1) % options.length;
      const targetOption = options[nextIndex];
      if (targetOption) {
        onChange(targetOption.value);
      }
    } else if (e.key === 'ArrowUp' && isOpen && options.length > 0) {
      e.preventDefault();
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const prevIndex = (currentIndex - 1 + options.length) % options.length;
      const targetOption = options[prevIndex];
      if (targetOption) {
        onChange(targetOption.value);
      }
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-[10px]',
    md: 'px-3 py-2 text-xs rounded-[12px]',
    lg: 'px-3.5 py-2.5 text-sm rounded-[14px]',
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 bg-[var(--card,#0A1226)] border transition-all select-none cursor-pointer text-left ${
          isOpen
            ? 'border-[var(--primary,#2563EB)] ring-2 ring-[var(--primary,#2563EB)]/20 text-slate-900 dark:text-white shadow-[0_0_12px_rgba(37,99,235,0.2)]'
            : 'border-[var(--line,#1A2442)] hover:border-[var(--primary,#2563EB)]/60 text-slate-900 dark:text-white'
        } ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={selectedOption ? 'text-slate-900 dark:text-white font-medium' : 'text-[var(--text-3,#6B7893)]'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={`w-4 h-4 text-[var(--text-2,#A8B3C7)] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[var(--primary,#2563EB)]' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 left-0 right-0 mt-1.5 min-w-[200px] max-h-60 overflow-y-auto rounded-[14px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] shadow-[0_16px_36px_-6px_rgba(0,0,0,0.4),0_0_16px_-4px_rgba(37,99,235,0.2)] p-1.5 space-y-0.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 scrollbar-thin scrollbar-thumb-[var(--line,#1A2442)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-[9px] text-xs transition-colors cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[var(--primary,#2563EB)]/15 text-[var(--brand-link,#3B82F6)] font-semibold border border-[var(--primary,#2563EB)]/30'
                    : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white hover:bg-[var(--card-hover,#0E182F)] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  {option.icon && <span className="shrink-0">{option.icon}</span>}
                  <span className="truncate">{option.label}</span>
                  {option.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-[var(--text-2,#A8B3C7)] shrink-0">
                      {option.badge}
                    </span>
                  )}
                </div>

                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--brand-link,#3B82F6)] shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
