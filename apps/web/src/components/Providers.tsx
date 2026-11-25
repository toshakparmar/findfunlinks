'use client';

import React, { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { SearchProvider } from '../lib/search-context';
import { FavoritesProvider } from '../lib/favorites-context';
import { WebsiteModalProvider } from '../lib/website-modal-context';

export function Providers({ children }: { children: React.ReactNode }) {
  // Automatically clean up any stale service workers (e.g. from previous local dev projects / MSW)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {});
        }
      });
    }
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <WebsiteModalProvider>
        <SearchProvider>
          <FavoritesProvider>
            {children}
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              toastOptions={{
                className: 'border font-sans bg-surface-1 text-token',
              }}
            />
          </FavoritesProvider>
        </SearchProvider>
      </WebsiteModalProvider>
    </NextThemesProvider>
  );
}
