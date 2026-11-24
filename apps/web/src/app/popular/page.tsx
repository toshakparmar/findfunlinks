import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PopularView } from '../../components/PopularView';
import { CircularLoader } from '../../components/ui/CircularLoader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Most Popular Websites & Top Working Mirrors',
  description:
    'Explore the highest-trafficked websites, popular web directories, and trending live domains on FinalLinks.',
  alternates: {
    canonical: 'https://finallinks.com/popular',
  },
};

export default function PopularPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-24 flex items-center justify-center">
          <CircularLoader size="lg" label="Loading" />
        </div>
      }
    >
      <PopularView />
    </Suspense>
  );
}
