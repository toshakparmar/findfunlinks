import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { NewView } from '../../components/NewView';
import { CircularLoader } from '../../components/ui/CircularLoader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Recently Added & Updated Websites',
  description:
    'Discover the latest websites, mirror links, and newly verified domain updates on FinalLinks.',
  alternates: {
    canonical: 'https://finallinks.com/new',
  },
};

export default function NewPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-24 flex items-center justify-center">
          <CircularLoader size="lg" label="Loading" />
        </div>
      }
    >
      <NewView />
    </Suspense>
  );
}
