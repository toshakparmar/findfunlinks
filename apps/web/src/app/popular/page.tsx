import type { Metadata } from 'next';
import { PopularView } from '../../components/PopularView';

export const metadata: Metadata = {
  title: 'Most Popular Websites & Top Working Mirrors',
  description:
    'Explore the highest-trafficked websites, popular web directories, and trending live domains on FindFunLinks.',
  alternates: {
    canonical: 'https://findfunlinks.com/popular',
  },
};

export default function PopularPage() {
  return <PopularView />;
}
