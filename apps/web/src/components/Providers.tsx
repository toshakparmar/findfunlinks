'use client';

import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { SearchProvider } from '../lib/search-context';
import { FavoritesProvider } from '../lib/favorites-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
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
    </NextThemesProvider>
  );
}
