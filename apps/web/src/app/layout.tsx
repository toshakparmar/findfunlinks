import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://findfunlinks.com'),
  title: {
    default: 'FindFunLinks — Curated Fun Websites & Active Working Mirrors',
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
    title: 'FindFunLinks — Curated Fun Websites & Active Working Mirrors',
    description:
      'Discover curated, entertaining websites and all their live working domains and mirrors.',
    siteName: 'FindFunLinks',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindFunLinks — Curated Fun Websites & Active Working Mirrors',
    description:
      'Discover curated, entertaining websites and all their live working domains and mirrors.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-brand-orange-200 selection:text-brand-orange-900 flex flex-col justify-between">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
