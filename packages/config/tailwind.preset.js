/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Client Design Surfaces
        surface: {
          bg: 'var(--bg)',
          header: 'var(--header)',
          sidebar: 'var(--sidebar)',
          card: 'var(--card)',
          'card-hover': 'var(--card-hover)',
          line: 'var(--line)',
        },
        // Client Design Typography
        content: {
          primary: 'var(--text)',
          secondary: 'var(--text-2)',
          muted: 'var(--text-3)',
        },
        // Brand palette derived directly from client logo & active pills
        brand: {
          blue: {
            DEFAULT: '#2563EB',
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563EB',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#0f172a',
          },
          link: '#3B82F6',
        },
        // Category Accents
        cat: {
          purple: 'var(--accent-purple)',
          blue: 'var(--accent-blue)',
          gold: 'var(--accent-gold)',
          red: 'var(--accent-red)',
          green: 'var(--accent-green)',
          cyan: 'var(--accent-cyan)',
          orange: 'var(--accent-orange)',
          pink: 'var(--accent-pink)',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontSize: {
        // Explicit type scale tokens (Iteration 3)
        'fs-xs': ['var(--fs-xs, 0.8125rem)', { lineHeight: '1.4' }],
        'fs-sm': ['var(--fs-sm, 0.875rem)', { lineHeight: '1.45' }],
        'fs-base': ['var(--fs-base, 1rem)', { lineHeight: '1.5' }],
        'fs-md': ['var(--fs-md, 1.0625rem)', { lineHeight: '1.5' }],
        'fs-lg': ['var(--fs-lg, 1.25rem)', { lineHeight: '1.35' }],
        'fs-xl': ['var(--fs-xl, 1.5rem)', { lineHeight: '1.3' }],
        'fs-2xl': ['var(--fs-2xl, clamp(1.75rem, 3vw, 2.25rem))', { lineHeight: '1.2' }],
        'fs-3xl': ['var(--fs-3xl, clamp(2rem, 4vw, 2.75rem))', { lineHeight: '1.2' }],
        // Standard tailwind classes aligned to minimum 13px (0.8125rem)
        xs: ['0.8125rem', { lineHeight: '1.4' }],
        sm: ['0.875rem', { lineHeight: '1.45' }],
        base: ['1rem', { lineHeight: '1.5' }],
        md: ['1.0625rem', { lineHeight: '1.5' }],
        lg: ['1.25rem', { lineHeight: '1.35' }],
        xl: ['1.5rem', { lineHeight: '1.3' }],
        '2xl': ['clamp(1.75rem, 3vw, 2.25rem)', { lineHeight: '1.2' }],
        '3xl': ['clamp(2rem, 4vw, 2.75rem)', { lineHeight: '1.2' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
