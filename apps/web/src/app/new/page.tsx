import type { Metadata } from 'next';
import { NewView } from '../../components/NewView';

export const metadata: Metadata = {
  title: 'Recently Added & Updated Websites',
  description:
    'Discover the latest websites, mirror links, and newly verified domain updates on FindFunLinks.',
  alternates: {
    canonical: 'https://findfunlinks.com/new',
  },
};

export default function NewPage() {
  return <NewView />;
}

