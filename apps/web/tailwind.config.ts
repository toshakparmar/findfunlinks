import type { Config } from 'tailwindcss';
import preset from '@finallinks/config/tailwind.preset.js';

const config: Config = {
  presets: [preset],
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/web/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    './packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg)',
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          sidebar: 'var(--sidebar)',
        },
        token: {
          DEFAULT: 'var(--text)',
          border: 'var(--border)',
          'border-strong': 'var(--border-strong)',
          text: 'var(--text)',
          'text-muted': 'var(--text-muted)',
          'text-faint': 'var(--text-faint)',
          primary: 'var(--primary)',
          'primary-fg': 'var(--primary-fg)',
          accent: 'var(--accent)',
          hot: 'var(--hot)',
        },
        status: {
          online: 'var(--status-online)',
          slow: 'var(--status-slow)',
          down: 'var(--status-down)',
        },
        category: {
          anime: 'var(--accent-anime)',
          downloads: 'var(--accent-downloads)',
          manga: 'var(--accent-manga)',
          music: 'var(--accent-music)',
          donghua: 'var(--accent-donghua)',
          gaming: 'var(--accent-gaming)',
          creative: 'var(--accent-creative)',
          developer: 'var(--accent-developer)',
          productivity: 'var(--accent-productivity)',
          community: 'var(--accent-community)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        pill: '9999px',
        card: '16px',
        row: '12px',
        chip: '8px',
      },
      boxShadow: {
        warm: '0 4px 20px -2px rgba(40, 30, 20, 0.06)',
        'warm-lg': '0 10px 30px -4px rgba(40, 30, 20, 0.1)',
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
