import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FindFunLinks — Super Admin Console',
  description: 'Administrative management console for FindFunLinks directory platform.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
