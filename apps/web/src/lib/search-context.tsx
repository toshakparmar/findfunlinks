'use client';

import React, { createContext, useContext, useState } from 'react';
import { WebsiteCardData } from '../components/DirectoryCard';

interface SearchContextValue {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  viewMode: 'cards' | 'simple';
  setViewMode: (v: 'cards' | 'simple') => void;
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
  reportModalWebsite: WebsiteCardData | null;
  setReportModalWebsite: (w: WebsiteCardData | null) => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'simple'>('cards');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportModalWebsite, setReportModalWebsite] = useState<WebsiteCardData | null>(null);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        viewMode,
        setViewMode,
        sidebarOpen,
        setSidebarOpen,
        reportModalWebsite,
        setReportModalWebsite,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return ctx;
}
