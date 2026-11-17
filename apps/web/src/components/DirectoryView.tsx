'use client';

import React, { useState } from 'react';
import { HeroSection } from './HeroSection';
import { DirectoryGrid, CategoryTab } from './DirectoryGrid';
import { WebsiteCardData } from './DirectoryCard';

interface DirectoryViewProps {
  categories: CategoryTab[];
  websites: WebsiteCardData[];
}

export function DirectoryView({ categories, websites }: DirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const totalMirrors = websites.reduce((acc, w) => acc + (w.domains?.length || 0), 0);

  return (
    <div className="min-h-screen">
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalWebsites={websites.length}
        totalMirrors={totalMirrors}
      />
      <DirectoryGrid initialCategories={categories} websites={websites} searchQuery={searchQuery} />
    </div>
  );
}
