'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface WebsiteModalContextType {
  activeSlug: string | null;
  isOpen: boolean;
  openWebsiteModal: (slug: string) => void;
  closeWebsiteModal: () => void;
}

const WebsiteModalContext = createContext<WebsiteModalContextType | undefined>(undefined);

export function WebsiteModalProvider({ children }: { children: React.ReactNode }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openWebsiteModal = useCallback((slug: string) => {
    setActiveSlug(slug);
    setIsOpen(true);
  }, []);

  const closeWebsiteModal = useCallback(() => {
    setIsOpen(false);
    setActiveSlug(null);
  }, []);

  return (
    <WebsiteModalContext.Provider
      value={{
        activeSlug,
        isOpen,
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
