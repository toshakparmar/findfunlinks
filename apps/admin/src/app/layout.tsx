import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';
import { AdminLayout } from '../components/AdminLayout';
import { BRAND } from '@finallinks/config';

export const metadata: Metadata = {
  title: `${BRAND.name} — Console`,
  description: 'Platform management, directory moderation, and website owner console.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="dark"
      style={{ colorScheme: 'dark' }}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#16181B] font-sans text-[#F3F4F6] antialiased selection:bg-[#0B9DF7]/30 selection:text-white">
        <Providers>
          <AdminLayout>{children}</AdminLayout>
        </Providers>
      </body>
    </html>
  );
}
