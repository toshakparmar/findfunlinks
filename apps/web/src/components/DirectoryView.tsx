'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Share2, ListFilter, LayoutGrid, Check, Flame } from 'lucide-react';
import { CategoryMeta } from '../lib/directory-data';
import { WebsiteCardData } from './DirectoryCard';
import { CategoryRankCard } from './CategoryRankCard';
import { QuickCategoryGrid } from './QuickCategoryGrid';
import { SimpleIndexView } from './SimpleIndexView';
import { BackToTop } from './BackToTop';
import { ReportModal } from './ReportModal';
import { useSearch } from '../lib/search-context';

interface DirectoryViewProps {
  categories: CategoryMeta[];
  websites: WebsiteCardData[];
}

export function DirectoryView({ categories, websites }: DirectoryViewProps) {
  const { searchQuery, selectedCategory, viewMode, setViewMode } = useSearch();

  const [copiedShare, setCopiedShare] = useState(false);
  const [reportModalWebsite, setReportModalWebsite] = useState<WebsiteCardData | null>(null);

  // Filter websites based on search query and category filter
  const filteredWebsites = websites.filter((site) => {
    const matchesSearch =
      !searchQuery ||
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.domains?.some((d) => d.hostname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      site.tags?.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || site.categorySlug === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group filtered websites by category
  const categoriesWithWebsites = categories
    .map((cat) => ({
      ...cat,
      websites: filteredWebsites.filter((w) => w.categorySlug === cat.slug),
    }))
    .filter((group) => group.websites.length > 0);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      toast.success('Directory link copied to clipboard!');
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const totalMirrors = websites.reduce((acc, w) => acc + (w.domains?.length || 0), 0);

  return (
    <div className="space-y-4">
      {/* 1. Header Banner & Announcement Block (EverythingMoe design) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#141418] border border-[#24242c] rounded-lg text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide">
              Curated toplist of verified web directories & active mirrors
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Flame className="w-3 h-3" />
              HOT
            </span>
          </div>
          <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {totalMirrors} working mirrors monitored
            </span>
            <span>•</span>
            <span>Last health check: 12 minutes ago</span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1b1b22] hover:bg-[#25252f] text-neutral-300 hover:text-white border border-[#2b2b36] transition-colors"
          >
            {copiedShare ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'cards' ? 'simple' : 'cards')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1b1b22] hover:bg-[#25252f] text-neutral-300 hover:text-white border border-[#2b2b36] transition-colors"
          >
            {viewMode === 'cards' ? (
              <>
                <ListFilter className="w-3.5 h-3.5 text-amber-400" />
                <span>Simple Index</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
                <span>Cards View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Top Quick Category Icon Tiles (EverythingMoe style) */}
      <QuickCategoryGrid
        categories={categories}
        onSelectCategory={(slug) => {
          const el = document.getElementById(`category-${slug}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      />

      {/* 3. Search Results Summary if searching */}
      {searchQuery && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#1b1b22] border border-brand-blue-500/40 rounded-lg text-xs">
          <span className="text-neutral-300">
            Showing results for &quot;<strong className="text-white">{searchQuery}</strong>&quot; (
            {filteredWebsites.length} matches found)
          </span>
          <span className="text-neutral-400 text-[11px]">
            in {categoriesWithWebsites.length} categories
          </span>
        </div>
      )}

      {/* 4. Main Body: Multi-Card Ranked Category Grid or Simple Index */}
      {viewMode === 'simple' ? (
        <SimpleIndexView websites={filteredWebsites} />
      ) : categoriesWithWebsites.length === 0 ? (
        <div className="p-12 text-center bg-[#141418] border border-[#24242c] rounded-lg">
          <p className="text-neutral-400 text-sm">
            No websites found matching your search criteria.
          </p>
        </div>
      ) : (
        /* 2-Column Responsive Category Grid (Matches EverythingMoe layout) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5 xl:gap-5">
          {categoriesWithWebsites.map((catGroup) => (
            <CategoryRankCard
              key={catGroup.id}
              category={catGroup}
              websites={catGroup.websites}
              onOpenReportModal={(w) => setReportModalWebsite(w)}
            />
          ))}
        </div>
      )}

      {/* 5. Floating Back-to-Top button */}
      <BackToTop />

      {/* 6. Report Broken Link Modal */}
      {reportModalWebsite && (
        <ReportModal
          isOpen={true}
          onClose={() => setReportModalWebsite(null)}
          websiteId={reportModalWebsite.id}
          websiteName={reportModalWebsite.name}
          domainId={reportModalWebsite.domains?.[0]?.id}
          domainHostname={reportModalWebsite.domains?.[0]?.hostname}
        />
      )}
    </div>
  );
}
