import type { Config } from 'tailwindcss';
import preset from '@findfunlinks/config/tailwind.preset.js';

const config: Config = {
  presets: [preset],
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg)',
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          sidebar: 'var(--sidebar)',
          header: 'var(--header)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
