import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';
import { AdminLayout } from '../components/AdminLayout';

export const metadata: Metadata = {
  title: 'FindFunLinks — Super Admin Console',
  description: 'Platform management, registration approvals, and directory moderation console.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-brand-blue-500/20 selection:text-brand-blue-700">
        <Providers>
          <AdminLayout>{children}</AdminLayout>
        </Providers>
      </body>
    </html>
  );
}
