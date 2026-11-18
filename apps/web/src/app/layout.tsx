import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';
import { MainLayout } from '../components/MainLayout';

export const metadata: Metadata = {
  metadataBase: new URL('https://findfunlinks.com'),
  title: {
    default: 'FindFunLinks — Curated Web Directory & Working Mirrors',
    template: '%s | FindFunLinks',
  },
  description:
    'Discover curated, entertaining websites and all their live working domains and mirrors so you never get stuck behind a broken link.',
  keywords: [
    'fun websites',
    'web directory',
    'working mirrors',
    'alternative links',
    'games',
    'anime',
    'utilities',
    'curated links',
  ],
  authors: [{ name: 'FindFunLinks Team' }],
  creator: 'FindFunLinks',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://findfunlinks.com',
    title: 'FindFunLinks — Curated Web Directory & Working Mirrors',
    description:
      'Discover curated, entertaining websites and all their live working domains and mirrors.',
    siteName: 'FindFunLinks',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindFunLinks — Curated Web Directory & Working Mirrors',
    description:
      'Discover curated, entertaining websites and all their live working domains and mirrors.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[#0a0a0c] font-sans text-neutral-100 antialiased selection:bg-brand-blue-600/30 selection:text-white">
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
