'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ReportModal } from './ReportModal';
import { BackToTop } from './BackToTop';
import { useSearch } from '../lib/search-context';
import { CategoryMeta, FALLBACK_CATEGORIES } from '../lib/directory-data';

interface MainLayoutProps {
  children: React.ReactNode;
  categories?: CategoryMeta[];
}

export function MainLayout({ children, categories = FALLBACK_CATEGORIES }: MainLayoutProps) {
  const {
    sidebarOpen,
    setSidebarOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    reportModalWebsite,
    setReportModalWebsite,
  } = useSearch();

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col font-sans selection:bg-brand-blue-600/30 selection:text-white">
      {/* 1. Left Sidebar Navigation (Desktop Fixed, Mobile Slide-out Drawer) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        categories={categories}
        activeCategorySlug={selectedCategory}
        onSelectCategory={(slug) => setSelectedCategory(slug)}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenReportModal={() =>
          setReportModalWebsite({
            id: 'general',
            name: 'General Link Report',
            slug: 'general',
            domains: [],
            categoryId: '',
          } as any)
        }
      />

      {/* 2. Main Area with Left Offset on Desktop */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300 min-w-0">
        {/* Top App Header */}
        <TopNav
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-5 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>

      {/* 3. Floating Scroll to Top */}
      <BackToTop />

      {/* 4. Broken Link Report Modal */}
      {reportModalWebsite && (
        <ReportModal
          isOpen={true}
          onClose={() => setReportModalWebsite(null)}
          websiteId={reportModalWebsite.id !== 'general' ? reportModalWebsite.id : undefined}
          websiteName={
            reportModalWebsite.name !== 'General Link Report' ? reportModalWebsite.name : undefined
          }
          domainId={reportModalWebsite.domains?.[0]?.id}
          domainHostname={reportModalWebsite.domains?.[0]?.hostname}
        />
      )}
    </div>
  );
}
