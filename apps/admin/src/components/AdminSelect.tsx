'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface AdminSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface AdminSelectProps {
  options: AdminSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  prefix?: React.ReactNode;
  id?: string;
}

export function AdminSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  disabled = false,
  searchable,
  prefix,
  id,
}: AdminSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  const selectedOption = options.find((opt) => opt.value === value);

  // Auto-enable search if there are more than 7 options unless explicitly disabled
  const showSearch = searchable ?? options.length > 7;

  // Filter options based on search query
  const filteredOptions =
    showSearch && searchQuery.trim()
      ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.trim().toLowerCase()))
      : options;

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen, showSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    } else if (e.key === 'ArrowDown' && isOpen && filteredOptions.length > 0) {
      e.preventDefault();
      const currentIndex = filteredOptions.findIndex((opt) => opt.value === value);
      const nextIndex = (currentIndex + 1) % filteredOptions.length;
      const target = filteredOptions[nextIndex];
      if (target) onChange(target.value);
    } else if (e.key === 'ArrowUp' && isOpen && filteredOptions.length > 0) {
      e.preventDefault();
      const currentIndex = filteredOptions.findIndex((opt) => opt.value === value);
      const prevIndex = (currentIndex - 1 + filteredOptions.length) % filteredOptions.length;
      const target = filteredOptions[prevIndex];
      if (target) onChange(target.value);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-11 px-3.5 rounded-lg border bg-[#16181B] text-sm font-medium transition-all select-none cursor-pointer text-left flex items-center justify-between gap-2 shadow-inner ${
          isOpen
            ? 'border-[#0B9DF7] ring-1 ring-[#0B9DF7] text-[#F3F4F6] shadow-[0_0_12px_rgba(11,157,247,0.2)]'
            : 'border-[#33373D] hover:border-[#4B5563] text-[#F3F4F6]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate flex items-center gap-2">
          {prefix && <span className="shrink-0">{prefix}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span
            className={
              selectedOption
                ? 'text-[#F3F4F6] font-medium truncate'
                : 'text-[#6B7280] font-normal truncate'
            }
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#0B9DF7]' : ''
          }`}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 right-0 z-50 mt-1.5 min-w-[200px] max-h-72 overflow-y-auto rounded-xl border border-[#33373D] bg-[#16181B] p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {/* Search Filter Input */}
          {showSearch && (
            <div className="p-1 mb-1 border-b border-[#26292F]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-2.5 top-2.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter..."
                  className="w-full h-8 pl-8 pr-2.5 rounded-md bg-[#1E2024] border border-[#33373D] text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7]"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-xs text-center text-[#6B7280]">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#0B9DF7]/15 text-[#0B9DF7] font-semibold'
                        : 'text-[#D1D5DB] hover:bg-[#26292F] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#26292F] text-[#9CA3AF]">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0B9DF7]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
