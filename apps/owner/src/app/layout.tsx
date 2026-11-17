import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';
import { OwnerLayout } from '../components/OwnerLayout';

export const metadata: Metadata = {
  title: 'FindFunLinks — Website Owner Portal',
  description: 'Manage your website profile, mirror domains, and uptime metrics.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          <OwnerLayout>{children}</OwnerLayout>
        </Providers>
      </body>
    </html>
  );
}
