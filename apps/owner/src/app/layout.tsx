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
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className="min-h-screen bg-[#050A18] font-sans text-[#F1F5F9] antialiased selection:bg-[#2563EB]/30 selection:text-white">
        <Providers>
          <OwnerLayout>{children}</OwnerLayout>
        </Providers>
      </body>
    </html>
  );
}
