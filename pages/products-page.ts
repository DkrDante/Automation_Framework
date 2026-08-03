import { Page } from '@playwright/test';
import { CatalogPage, CatalogFixture } from './catalog-page';
import productsData from '../fixtures/products.json';

export class ProductsPage extends CatalogPage {
  constructor(page: Page) {
    super(page, productsData as CatalogFixture);
  }

  async viewProduct(name: string) {
    await this.card(name).getByRole('button', { name: 'View' }).click();
  }

  /** Cards show how many experiences link the product ("Experiences: 2"). */
  experienceCount(name: string) {
    return this.card(name).getByText(/^Experiences:\s*\d+$/);
  }
}
