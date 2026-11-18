'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { CategoryMeta } from '../lib/directory-data';
import { ReportModal } from './ReportModal';

interface AppShellProps {
  children: (props: {
    searchQuery: string;
    selectedCategory: string;
    viewMode: 'cards' | 'simple';
    onToggleViewMode: (mode: 'cards' | 'simple') => void;
  }) => React.ReactNode;
  categories: CategoryMeta[];
}

export function AppShell({ children, categories }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'simple'>('cards');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col font-sans">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        categories={categories}
        activeCategorySlug={selectedCategory}
        onSelectCategory={(slug) => setSelectedCategory(slug)}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenReportModal={() => setReportModalOpen(true)}
      />

      {/* 2. Main Page Layout with Left Offset on Desktop */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        {/* Top Navigation Bar */}
        <TopNav
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-3 sm:p-5 max-w-[1600px] w-full mx-auto">
          {children({
            searchQuery,
            selectedCategory,
            viewMode,
            onToggleViewMode: setViewMode,
          })}
        </main>
      </div>

      {/* 3. Global Broken Link Report Modal */}
      {reportModalOpen && (
        <ReportModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} />
      )}
    </div>
  );
}
