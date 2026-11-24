'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { SiteHeader } from './SiteHeader';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { SiteFooter } from './SiteFooter';
import { SearchOverlay, SearchResultItem } from './SearchOverlay';
import { MobileMenu } from './MobileMenu';
import { SiteDomainsDrawer, SiteDetailModalData } from './SiteDomainsDrawer';
import { ReportModal } from './ReportModal';
import { ScrollProgressBar } from './ScrollProgressBar';
import { GlobalNavigationLoader } from './GlobalNavigationLoader';
import { useSearch } from '../lib/search-context';
import { useWebsiteModal } from '../lib/website-modal-context';
import { CLIENT_18_CATEGORIES } from '../lib/client-catalog';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { reportModalWebsite, setReportModalWebsite } = useSearch();
  const { openWebsiteModal } = useWebsiteModal();

  const { resolvedTheme, setTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSiteDrawer, setActiveSiteDrawer] = useState<SiteDetailModalData | null>(null);

  // Global Keyboard Shortcuts (Ctrl+K to open search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }

      if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search handler across catalog
  const handleSearch = (query: string): SearchResultItem[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: SearchResultItem[] = [];
    for (const cat of CLIENT_18_CATEGORIES) {
      for (const site of cat.sites) {
        if (
          site.name.toLowerCase().includes(q) ||
          site.slug.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q)
        ) {
          results.push({
            id: site.id,
            name: site.name,
            displayName: site.displayName,
            slug: site.slug,
            categoryName: cat.name,
            accentColor: cat.themeColor || '#3B82F6',
            faviconUrl: site.faviconUrl,
            bestDomainUrl: site.bestDomainUrl,
          });
          if (results.length >= 20) return results;
        }
      }
    }
    return results;
  };

  const handleSelectSearchResult = (item: SearchResultItem) => {
    setIsSearchOpen(false);
    openWebsiteModal(item.slug);
  };

  const pathname = usePathname();
  const isFocusLayout = pathname?.startsWith('/register');

  return (
    <div className="min-h-screen bg-[var(--bg,#050A18)] text-[var(--text,#F1F5F9)] flex flex-col font-sans selection:bg-[var(--primary,#2563EB)]/30 selection:text-white">
      {/* 0. Top Reading / Scroll Progress Bar & Route Navigation Loader */}
      <ScrollProgressBar />
      <React.Suspense fallback={null}>
        <GlobalNavigationLoader />
      </React.Suspense>

      {/* 1. Sticky Site Header (Desktop & Mobile) */}
      <SiteHeader
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        currentTheme={resolvedTheme === 'light' ? 'light' : 'dark'}
        onToggleTheme={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      />

      {/* 2. Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-full">
        {/* Desktop Narrow Left Rail Sidebar (hidden on focus pages like /register) */}
        {!isFocusLayout && <Sidebar />}

        {/* Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-2 sm:p-4 md:p-5 lg:p-6 pb-20 lg:pb-8 w-full max-w-[1560px] mx-auto">
            {children}
          </main>
          <SiteFooter />
        </div>
      </div>

      {/* 3. Mobile Fixed Bottom Navigation Bar */}
      <BottomNav />

      {/* 4. Instant Search Overlay Modal */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
        onSelectSite={handleSelectSearchResult}
      />

      {/* 5. Mobile Navigation Menu Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentTheme={resolvedTheme === 'light' ? 'light' : 'dark'}
        onToggleTheme={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      />

      {/* 6. Site Working Mirrors Drawer */}
      <SiteDomainsDrawer
        isOpen={!!activeSiteDrawer}
        onClose={() => setActiveSiteDrawer(null)}
        site={activeSiteDrawer}
      />

      {/* 7. Broken Link Report Modal (if triggered) */}
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
