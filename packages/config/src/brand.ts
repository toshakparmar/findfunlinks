declare const process: { env?: Record<string, string | undefined> } | undefined;

export const BRAND = {
  name: 'FinalLinks',
  wordmark: { first: 'Final', second: 'Links' }, // two-tone wordmark
  tagline: 'Your Hub for Movies, Shows, OTT, Anime and More.',
  domain: typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SITE_DOMAIN : undefined, // confirm final domain with client; do NOT hardcode
  siteUrl: typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SITE_URL : undefined,
  supportEmail: typeof process !== 'undefined' ? process.env?.SUPPORT_EMAIL : undefined,
  fromName: 'FinalLinks',
} as const;

export type BrandConfig = typeof BRAND;
