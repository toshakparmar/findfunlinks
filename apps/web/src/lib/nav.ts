/**
 * Single source of truth for navigation active states derived strictly from URL pathname.
 */
export type ActiveHeaderTab = 'home' | 'categories' | 'new' | 'popular' | 'requests' | null;

export interface NavActiveState {
  header: ActiveHeaderTab;
  sidebar: string | null; // 'all' or category slug, or null on unrelated pages
}

export function getActive(pathname: string): NavActiveState {
  const normalized =
    pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  const header: ActiveHeaderTab =
    normalized === '' || normalized === '/' || normalized.startsWith('/category/')
      ? 'home'
      : normalized.startsWith('/categories')
        ? 'categories'
        : normalized.startsWith('/new') || normalized.startsWith('/hot')
          ? 'new'
          : normalized.startsWith('/popular')
            ? 'popular'
            : normalized.startsWith('/requests')
              ? 'requests'
              : null;

  const sidebar =
    normalized === '' || normalized === '/'
      ? 'all'
      : normalized.startsWith('/category/')
        ? normalized.split('/')[2] || null
        : null;

  return { header, sidebar };
}
