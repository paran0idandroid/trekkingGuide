import { getItem, setItem } from './storage';

const FAVORITES_KEY = 'favorites';

/** Get all favorite route slugs */
export function getFavorites(): string[] {
  return getItem<string[]>(FAVORITES_KEY) ?? [];
}

/** Add a route slug to favorites */
export function addFavorite(slug: string): void {
  const current = getFavorites();
  if (!current.includes(slug)) {
    setItem(FAVORITES_KEY, [...current, slug]);
  }
}

/** Remove a route slug from favorites */
export function removeFavorite(slug: string): void {
  const current = getFavorites();
  setItem(FAVORITES_KEY, current.filter(s => s !== slug));
}

/** Check if a route is favorited */
export function isFavorite(slug: string): boolean {
  return getFavorites().includes(slug);
}

/** Toggle favorite status. Returns new state (true = favorited). */
export function toggleFavorite(slug: string): boolean {
  if (isFavorite(slug)) {
    removeFavorite(slug);
    return false;
  } else {
    addFavorite(slug);
    return true;
  }
}
