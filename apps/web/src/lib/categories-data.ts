/**
 * FinalLinks — Complete 29 Category Catalog (Iteration 3)
 * Full reference list with neon accents, Lucide icon keys, and total site counts.
 */

export interface DirectoryCategoryItem {
  id: string;
  slug: string;
  name: string;
  iconName: string;
  accentKey: string;
  themeColor: string;
  total: number;
  homeOrder: number;
}

export const CATEGORIES_29_CATALOG: DirectoryCategoryItem[] = [
  {
    id: 'movies',
    slug: 'movies',
    name: 'Movies',
    iconName: 'Clapperboard',
    accentKey: 'accent-purple',
    themeColor: '#A855F7',
    total: 94,
    homeOrder: 1,
  },
  {
    id: 'tv-shows',
    slug: 'tv-shows',
    name: 'TV Shows',
    iconName: 'Tv',
    accentKey: 'accent-gold',
    themeColor: '#EAB308',
    total: 78,
    homeOrder: 2,
  },
  {
    id: 'ott-platforms',
    slug: 'ott-platforms',
    name: 'OTT Platforms',
    iconName: 'Tv2',
    accentKey: 'accent-red',
    themeColor: '#EF4444',
    total: 86,
    homeOrder: 3,
  },
  {
    id: 'anime',
    slug: 'anime',
    name: 'Anime',
    iconName: 'Smile',
    accentKey: 'accent-pink',
    themeColor: '#EC4899',
    total: 112,
    homeOrder: 4,
  },
  {
    id: 'sports',
    slug: 'sports',
    name: 'Sports',
    iconName: 'Trophy',
    accentKey: 'accent-cyan',
    themeColor: '#06B6D4',
    total: 45,
    homeOrder: 5,
  },
  {
    id: 'cartoons',
    slug: 'cartoons',
    name: 'Cartoons',
    iconName: 'Sparkles',
    accentKey: 'accent-orange',
    themeColor: '#F59E0B',
    total: 38,
    homeOrder: 6,
  },
  {
    id: 'documentary',
    slug: 'documentary',
    name: 'Documentary',
    iconName: 'Video',
    accentKey: 'accent-green',
    themeColor: '#22C55E',
    total: 52,
    homeOrder: 7,
  },
  {
    id: 'web-series',
    slug: 'web-series',
    name: 'Web Series',
    iconName: 'Layers',
    accentKey: 'accent-purple',
    themeColor: '#8B5CF6',
    total: 64,
    homeOrder: 8,
  },
  {
    id: 'k-drama',
    slug: 'k-drama',
    name: 'K-Drama',
    iconName: 'Clapperboard',
    accentKey: 'accent-pink',
    themeColor: '#EC4899',
    total: 49,
    homeOrder: 9,
  },
  {
    id: 'c-drama',
    slug: 'c-drama',
    name: 'C-Drama',
    iconName: 'Landmark',
    accentKey: 'accent-red',
    themeColor: '#EF4444',
    total: 36,
    homeOrder: 10,
  },
  {
    id: 'anime-movies',
    slug: 'anime-movies',
    name: 'Anime Movies',
    iconName: 'Disc3',
    accentKey: 'accent-purple',
    themeColor: '#8B5CF6',
    total: 42,
    homeOrder: 11,
  },
  {
    id: 'hollywood',
    slug: 'hollywood',
    name: 'Hollywood',
    iconName: 'Film',
    accentKey: 'accent-gold',
    themeColor: '#EAB308',
    total: 75,
    homeOrder: 12,
  },
  {
    id: 'bollywood',
    slug: 'bollywood',
    name: 'Bollywood',
    iconName: 'Film',
    accentKey: 'accent-pink',
    themeColor: '#D946EF',
    total: 68,
    homeOrder: 13,
  },
  {
    id: 'south-indian',
    slug: 'south-indian',
    name: 'South Indian',
    iconName: 'CircleDot',
    accentKey: 'accent-blue',
    themeColor: '#0284C7',
    total: 54,
    homeOrder: 14,
  },
  {
    id: 'regional-movies',
    slug: 'regional-movies',
    name: 'Regional Movies',
    iconName: 'MapPin',
    accentKey: 'accent-purple',
    themeColor: '#8B5CF6',
    total: 33,
    homeOrder: 15,
  },
  {
    id: 'short-films',
    slug: 'short-films',
    name: 'Short Films',
    iconName: 'PlaySquare',
    accentKey: 'accent-cyan',
    themeColor: '#06B6D4',
    total: 28,
    homeOrder: 16,
  },
  {
    id: 'stand-up-comedy',
    slug: 'stand-up-comedy',
    name: 'Stand-Up Comedy',
    iconName: 'Mic',
    accentKey: 'accent-orange',
    themeColor: '#F59E0B',
    total: 41,
    homeOrder: 17,
  },
  {
    id: 'reality-shows',
    slug: 'reality-shows',
    name: 'Reality Shows',
    iconName: 'Crown',
    accentKey: 'accent-gold',
    themeColor: '#EAB308',
    total: 29,
    homeOrder: 18,
  },
  {
    id: 'kids',
    slug: 'kids',
    name: 'Kids',
    iconName: 'Baby',
    accentKey: 'accent-green',
    themeColor: '#22C55E',
    total: 44,
    homeOrder: 19,
  },
  {
    id: 'live-tv',
    slug: 'live-tv',
    name: 'Live TV',
    iconName: 'Radio',
    accentKey: 'accent-red',
    themeColor: '#EF4444',
    total: 62,
    homeOrder: 20,
  },
  {
    id: 'news',
    slug: 'news',
    name: 'News',
    iconName: 'Newspaper',
    accentKey: 'accent-blue',
    themeColor: '#0EA5E9',
    total: 51,
    homeOrder: 21,
  },
  {
    id: 'music',
    slug: 'music',
    name: 'Music',
    iconName: 'Music',
    accentKey: 'accent-pink',
    themeColor: '#EC4899',
    total: 89,
    homeOrder: 22,
  },
  {
    id: 'gaming',
    slug: 'gaming',
    name: 'Gaming',
    iconName: 'Gamepad2',
    accentKey: 'accent-purple',
    themeColor: '#A855F7',
    total: 97,
    homeOrder: 23,
  },
  {
    id: 'esports',
    slug: 'esports',
    name: 'Esports',
    iconName: 'Trophy',
    accentKey: 'accent-cyan',
    themeColor: '#06B6D4',
    total: 35,
    homeOrder: 24,
  },
  {
    id: 'fitness',
    slug: 'fitness',
    name: 'Fitness',
    iconName: 'Dumbbell',
    accentKey: 'accent-green',
    themeColor: '#22C55E',
    total: 27,
    homeOrder: 25,
  },
  {
    id: 'cooking',
    slug: 'cooking',
    name: 'Cooking',
    iconName: 'UtensilsCrossed',
    accentKey: 'accent-orange',
    themeColor: '#F59E0B',
    total: 34,
    homeOrder: 26,
  },
  {
    id: 'travel',
    slug: 'travel',
    name: 'Travel',
    iconName: 'Plane',
    accentKey: 'accent-blue',
    themeColor: '#0EA5E9',
    total: 39,
    homeOrder: 27,
  },
  {
    id: 'technology',
    slug: 'technology',
    name: 'Technology',
    iconName: 'Cpu',
    accentKey: 'accent-purple',
    themeColor: '#8B5CF6',
    total: 82,
    homeOrder: 28,
  },
  {
    id: 'education',
    slug: 'education',
    name: 'Education',
    iconName: 'GraduationCap',
    accentKey: 'accent-blue',
    themeColor: '#0284C7',
    total: 58,
    homeOrder: 29,
  },
];

/**
 * Category Slug Alias Resolver
 * Maps near-duplicate slugs cleanly to new slugs for backwards compatibility.
 */
export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  'anime-streaming': 'anime',
  documentaries: 'documentary',
  educational: 'education',
  games: 'gaming',
  'kids-family': 'kids',
};

export function resolveCategorySlug(slug: string): string {
  return CATEGORY_SLUG_ALIASES[slug] || slug;
}

/**
 * Extra metadata mappings for categories that may be added to or exist in the DB
 * Ensures they get appropriate icons and vibrant neon theme colors instead of plain blue.
 */
export const EXTRA_CATEGORY_METADATA: Record<
  string,
  { iconName: string; themeColor: string; accentKey?: string }
> = {
  software: { iconName: 'Monitor', themeColor: '#3B82F6', accentKey: 'accent-blue' },
  tools: { iconName: 'Wrench', themeColor: '#F59E0B', accentKey: 'accent-orange' },
  ebooks: { iconName: 'BookOpen', themeColor: '#8B5CF6', accentKey: 'accent-purple' },
  comics: { iconName: 'Sparkles', themeColor: '#EC4899', accentKey: 'accent-pink' },
  podcasts: { iconName: 'Mic', themeColor: '#06B6D4', accentKey: 'accent-cyan' },
  theatre: { iconName: 'Film', themeColor: '#D946EF', accentKey: 'accent-pink' },
  'kids-family': { iconName: 'Baby', themeColor: '#22C55E', accentKey: 'accent-green' },
  'anime-streaming': { iconName: 'Smile', themeColor: '#EC4899', accentKey: 'accent-pink' },
  documentaries: { iconName: 'Video', themeColor: '#22C55E', accentKey: 'accent-green' },
  educational: { iconName: 'GraduationCap', themeColor: '#0284C7', accentKey: 'accent-blue' },
  games: { iconName: 'Gamepad2', themeColor: '#A855F7', accentKey: 'accent-purple' },
  others: { iconName: 'MoreHorizontal', themeColor: '#14B8A6', accentKey: 'accent-green' },
};

const DYNAMIC_NEON_PALETTE = [
  '#00A3FF',
  '#A855F7',
  '#EAB308',
  '#EF4444',
  '#EC4899',
  '#06B6D4',
  '#F59E0B',
  '#22C55E',
  '#8B5CF6',
  '#D946EF',
  '#14B8A6',
  '#0EA5E9',
];

export function getCategoryMetadata(
  slug: string,
  name?: string,
): { iconName: string; themeColor: string; accentKey: string } {
  const normalized = (CATEGORY_SLUG_ALIASES[slug.toLowerCase()] || slug).toLowerCase();

  // Check catalog match first
  const catalogItem = CATEGORIES_29_CATALOG.find(
    (c) =>
      c.slug.toLowerCase() === normalized || c.name.toLowerCase() === (name || '').toLowerCase(),
  );
  if (catalogItem) {
    return {
      iconName: catalogItem.iconName,
      themeColor: catalogItem.themeColor,
      accentKey: catalogItem.accentKey,
    };
  }

  // Check extra known category metadata
  if (EXTRA_CATEGORY_METADATA[slug.toLowerCase()]) {
    const extra = EXTRA_CATEGORY_METADATA[slug.toLowerCase()]!;
    return {
      iconName: extra.iconName,
      themeColor: extra.themeColor,
      accentKey: extra.accentKey || 'accent-blue',
    };
  }

  // Deterministic vibrant neon color fallback (never plain blue)
  let hash = 0;
  const str = slug.toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % DYNAMIC_NEON_PALETTE.length;
  return {
    iconName: 'Folder',
    themeColor: DYNAMIC_NEON_PALETTE[colorIndex] || '#00A3FF',
    accentKey: 'accent-cyan',
  };
}
