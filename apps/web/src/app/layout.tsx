import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';
import { MainLayout } from '../components/MainLayout';

export const metadata: Metadata = {
  metadataBase: new URL('https://finallinks.com'),
  title: {
    default: 'FinalLinks — Curated Web Directory & Working Mirrors',
    template: '%s | FinalLinks',
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
  authors: [{ name: 'FinalLinks Team' }],
  creator: 'FinalLinks',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://finallinks.com',
    title: 'FinalLinks — Curated Web Directory & Working Mirrors',
    description:
      'Discover curated, entertaining websites and all their live working domains and mirrors.',
    siteName: 'FinalLinks',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinalLinks — Curated Web Directory & Working Mirrors',
    description:
      'Discover curated, entertaining websites and all their live working domains and mirrors.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-page font-sans text-token antialiased selection:bg-primary/20 selection:text-primary">
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
