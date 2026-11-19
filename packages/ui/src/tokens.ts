/**
 * FindFunLinks — Client Design Tokens
 * Synced with packages/ui/tokens.md and packages/ui/styles/tokens.css
 */

export const DesignTokens = {
  surfaces: {
    dark: {
      bg: '#050A18',
      header: '#070D1E',
      sidebar: '#070D1E',
      card: '#0A1226',
      cardHover: '#0E182F',
      line: '#1A2442',
    },
    light: {
      bg: '#F3F6FC',
      header: '#FFFFFF',
      sidebar: '#FFFFFF',
      card: '#FFFFFF',
      cardHover: '#F8FAFC',
      line: '#D9E1F0',
    },
  },
  typography: {
    fontHeading: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontBody: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  brand: {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    brandLink: '#3B82F6',
    focusRing: 'rgba(59, 130, 246, 0.6)',
  },
  status: {
    ok: '#22C55E',
    warn: '#F59E0B',
    bad: '#EF4444',
  },
  categoryAccents: {
    purple: '#8B5CF6',
    blue: '#3B82F6',
    gold: '#EAB308',
    red: '#EF4444',
    green: '#14B8A6',
    cyan: '#06B6D4',
    orange: '#F97316',
    pink: '#EC4899',
  },
  cardAccents: {
    'ott-platforms': '#8B5CF6',
    movies: '#3B82F6',
    'tv-shows': '#EAB308',
    'anime-streaming': '#EF4444',
    sports: '#2563EB',
    'live-tv': '#7C3AED',
    music: '#9333EA',
    games: '#14B8A6',
    software: '#06B6D4',
    tools: '#F59E0B',
    documentaries: '#6366F1',
    educational: '#22C55E',
    ebooks: '#10B981',
    comics: '#0EA5E9',
    podcasts: '#F97316',
    theatre: '#A855F7',
    'kids-family': '#FACC15',
    others: '#64748B',
  },
  radii: {
    card: '16px',
    pill: '12px',
    button: '10px',
    full: '9999px',
  },
} as const;

export type DesignTokens = typeof DesignTokens;
export const BrandTokens = DesignTokens; // Backward compatibility
