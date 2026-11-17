export const BrandTokens = {
  colors: {
    primaryBlue: '#0B57D9',
    primaryBlueHover: '#0948B5',
    accentOrange: '#F59E0B',
    accentOrangeHover: '#D97706',
    hotFlame: '#EA580C',
    hotFlameHover: '#C2410C',
    darkBg: '#0A0F1D',
    darkSurface: '#111827',
    darkSurfaceElevated: '#1E293B',
    lightBg: '#F8FAFC',
    lightSurface: '#FFFFFF',
    lightBorder: '#E2E8F0',
    darkBorder: '#1E293B',
  },
  radii: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  typography: {
    fontSans:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
} as const;

export type BrandTokens = typeof BrandTokens;
