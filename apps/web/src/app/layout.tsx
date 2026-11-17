import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FindFunLinks — Curated Fun Websites & Active Working Mirrors',
  description:
    'Discover curated, entertaining websites and all their live working domains and mirrors so you never get stuck behind a broken link.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-brand-orange-200 selection:text-brand-orange-900">
        {children}
      </body>
    </html>
  );
}
