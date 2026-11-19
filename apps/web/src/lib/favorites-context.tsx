'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface FavoritesContextType {
  favorites: string[]; // website IDs
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  recentlyVisited: string[]; // website IDs
  addRecentlyVisited: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_KEY = 'findfunlinks_favorites';
const RECENT_KEY = 'findfunlinks_recent';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyVisited, setRecentlyVisited] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem(FAVORITES_KEY);
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedRecent = localStorage.getItem(RECENT_KEY);
      if (savedRecent) setRecentlyVisited(JSON.parse(savedRecent));
    } catch {
      // Ignore local storage errors
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const addRecentlyVisited = (id: string) => {
    setRecentlyVisited((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const next = [id, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        recentlyVisited,
        addRecentlyVisited,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return ctx;
}
