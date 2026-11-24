import type { Config } from 'tailwindcss';
import preset from '@finallinks/config/tailwind.preset.js';

const config: Config = {
  presets: [preset],
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/admin/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    './packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        page: '#16181B',
        panel: {
          bg: '#16181B',
          surface: '#1E2024',
          hover: '#26292F',
          active: '#2F333B',
          border: '#33373D',
          borderSubtle: '#26292F',
          text: '#F3F4F6',
          muted: '#9CA3AF',
          faint: '#6B7280',
          accent: '#0B9DF7',
          accentHover: '#0A8FE0',
        },
      },
      fontFamily: {
        sans: [
          '"IBM Plex Sans"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"IBM Plex Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      minHeight: {
        control: '44px',
      },
    },
  },
  plugins: [],
};

export default config;
