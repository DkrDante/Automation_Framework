/** An item rendered as a card on a catalog page — a scene or a product. */
export interface CatalogItem {
  id: string;
  name: string;
  date: string;
  status: string;
}

export interface Product extends CatalogItem {
  category: string;
  subCategory: string | null;
}

export interface Scene extends CatalogItem {
  productId: string;
  productIds?: string[];
}

export type CategoryLevel = 'category' | 'subCategory';

export const unarchived = <T extends CatalogItem>(items: T[]) =>
  items.filter((i) => i.status !== 'archived');
export const archived = <T extends CatalogItem>(items: T[]) =>
  items.filter((i) => i.status === 'archived');

const byDate = (dir: 1 | -1) => <T extends CatalogItem>(items: T[]) =>
  [...items].sort((a, b) => dir * (new Date(a.date).getTime() - new Date(b.date).getTime()));

const byName = (dir: 1 | -1) => <T extends CatalogItem>(items: T[]) =>
  [...items].sort((a, b) => dir * a.name.localeCompare(b.name));

export const byOldestFirst = byDate(1);
export const byNewestFirst = byDate(-1);
export const byNameAsc = byName(1);
export const byNameDesc = byName(-1);

/** Maps a sort dropdown label to the ordering the UI is expected to apply. */
export const SORT_ORDERINGS: Record<string, <T extends CatalogItem>(items: T[]) => T[]> = {
  'Newest First': byNewestFirst,
  'Oldest First': byOldestFirst,
  'Name A-Z': byNameAsc,
  'Name Z-A': byNameDesc,
};

/**
 * Titles of the cards the grid should render for an already-ordered list. The
 * grid shows one page at a time, so every API-derived expectation has to be
 * truncated the same way before comparing.
 */
export const firstPageTitles = (items: CatalogItem[], pageSize: number) =>
  items.slice(0, pageSize).map((i) => i.name.trim());

/** Products filed directly under a category (or one of its subcategories). */
export const productsInCategory = (
  products: Product[],
  slug: string,
  level: CategoryLevel = 'category'
) => products.filter((p) => p[level] === slug);

/**
 * Scenes whose linked products sit under a category. Scenes reach products
 * through `productIds`, falling back to the legacy single `productId`.
 */
export function scenesInCategory(
  scenes: Scene[],
  products: Product[],
  slug: string,
  level: CategoryLevel = 'category'
): Scene[] {
  const productIds = new Set(productsInCategory(products, slug, level).map((p) => p.id));
  return scenes.filter((s) => (s.productIds ?? [s.productId]).some((id) => productIds.has(id)));
}
