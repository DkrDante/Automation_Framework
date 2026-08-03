import experiencesData from '../fixtures/experiences.json';

// The experiences grid renders one page of cards at a time; every expectation
// built from the API has to be truncated the same way before comparing.
export const PAGE_SIZE = experiencesData.page_size;

export interface Scene {
  id: string;
  name: string;
  date: string;
  status: string;
  productId: string;
  productIds?: string[];
}

export interface Product {
  id: string;
  category: string;
  subCategory: string | null;
}

export const unarchived = (scenes: Scene[]) => scenes.filter((s) => s.status !== 'archived');
export const archived = (scenes: Scene[]) => scenes.filter((s) => s.status === 'archived');

const byDate = (dir: 1 | -1) => (scenes: Scene[]) =>
  [...scenes].sort((a, b) => dir * (new Date(a.date).getTime() - new Date(b.date).getTime()));

const byName = (dir: 1 | -1) => (scenes: Scene[]) =>
  [...scenes].sort((a, b) => dir * a.name.localeCompare(b.name));

export const byOldestFirst = byDate(1);
export const byNewestFirst = byDate(-1);
export const byNameAsc = byName(1);
export const byNameDesc = byName(-1);

// Maps a sort dropdown label to the ordering the UI is expected to apply.
export const SORT_ORDERINGS: Record<string, (scenes: Scene[]) => Scene[]> = {
  'Newest First': byNewestFirst,
  'Oldest First': byOldestFirst,
  'Name A-Z': byNameAsc,
  'Name Z-A': byNameDesc,
};

/** Titles of the cards the grid should render for an already-ordered scene list. */
export const firstPageTitles = (scenes: Scene[]) =>
  scenes.slice(0, PAGE_SIZE).map((s) => s.name.trim());

/**
 * Scenes whose linked products sit under a category (or one of its
 * subcategories). Scenes link products through `productIds`, falling back to
 * the legacy single `productId`.
 */
export function scenesInCategory(
  scenes: Scene[],
  products: Product[],
  slug: string,
  level: 'category' | 'subCategory' = 'category'
): Scene[] {
  const productIds = new Set(products.filter((p) => p[level] === slug).map((p) => p.id));
  return scenes.filter((s) =>
    (s.productIds ?? [s.productId]).some((id) => productIds.has(id))
  );
}
