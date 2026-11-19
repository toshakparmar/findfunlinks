import type { Metadata } from 'next';
import { RequestsView } from '../../components/RequestsView';

export const metadata: Metadata = {
  title: 'Website Owner Requests & Link Submissions',
  description:
    'List your website on FindFunLinks, suggest new entertainment destinations, or report broken domains.',
  alternates: {
    canonical: 'https://findfunlinks.com/requests',
  },
};

export default function RequestsPage() {
  return <RequestsView />;
}

