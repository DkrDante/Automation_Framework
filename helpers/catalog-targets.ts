import { Page } from '@playwright/test';
import { DashboardAPIService } from '../services/api_service';
import { CatalogPage, CatalogFixture } from '../pages/catalog-page';
import { ExperiencePage } from '../pages/experiences-page';
import { ProductsPage } from '../pages/products-page';
import experiencesData from '../fixtures/experiences.json';
import productsData from '../fixtures/products.json';
import {
  CatalogItem,
  CategoryLevel,
  productsInCategory,
  scenesInCategory,
} from './catalog-data';

/**
 * Binds a catalog page to its fixture and to the API calls that reproduce what
 * the grid should show. The shared suites in catalog-ui-suite.ts and
 * catalog-consistency-suite.ts are written entirely against this interface.
 */
export interface CatalogTarget {
  name: string;
  data: CatalogFixture;
  newPage(page: Page): CatalogPage;
  /** Every item the page can list, in API order and including archived ones. */
  allItems(api: DashboardAPIService): Promise<CatalogItem[]>;
  /** Same, narrowed to a category slug at the given level. */
  itemsInCategory(
    api: DashboardAPIService,
    slug: string,
    level: CategoryLevel
  ): Promise<CatalogItem[]>;
}

export const EXPERIENCES_TARGET: CatalogTarget = {
  name: 'Experiences',
  data: experiencesData as CatalogFixture,
  newPage: (page) => new ExperiencePage(page),
  allItems: async (api) => (await api.getScenes()).scenes,
  itemsInCategory: async (api, slug, level) => {
    const [scenesResponse, products] = await Promise.all([api.getScenes(), api.getProducts()]);
    return scenesInCategory(scenesResponse.scenes, products, slug, level);
  },
};

export const PRODUCTS_TARGET: CatalogTarget = {
  name: 'Products',
  data: productsData as CatalogFixture,
  newPage: (page) => new ProductsPage(page),
  allItems: (api) => api.getProducts(),
  itemsInCategory: async (api, slug, level) =>
    productsInCategory(await api.getProducts(), slug, level),
};
