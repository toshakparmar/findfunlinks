'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface WebsiteModalContextType {
  activeSlug: string | null;
  isOpen: boolean;
  openWebsiteModal: (slug: string) => void;
  closeWebsiteModal: () => void;
}

const WebsiteModalContext = createContext<WebsiteModalContextType | undefined>(undefined);

export function WebsiteModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const openWebsiteModal = useCallback(
    (slug: string) => {
      if (slug) {
        router.push(`/website/${encodeURIComponent(slug)}`);
      }
    },
    [router],
  );

  const closeWebsiteModal = useCallback(() => {}, []);

  return (
    <WebsiteModalContext.Provider
      value={{
        activeSlug: null,
        isOpen: false,
        openWebsiteModal,
        closeWebsiteModal,
      }}
    >
      {children}
    </WebsiteModalContext.Provider>
  );
}

export function useWebsiteModal() {
  const context = useContext(WebsiteModalContext);
  if (!context) {
    // Return safe fallback if used outside provider
    return {
      activeSlug: null,
      isOpen: false,
      openWebsiteModal: () => {},
      closeWebsiteModal: () => {},
    };
  }
  return context;
}
