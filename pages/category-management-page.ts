import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class CategoryManagementPage extends BasePage {
  readonly heading: Locator;
  readonly saveCategoryBtn: Locator;
  readonly reloadBtn: Locator;
  readonly categoriesHeader: Locator;
  readonly categoryNameColumnHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Category Manager' });
    this.saveCategoryBtn = page.getByRole('button', { name: 'Save category' });
    this.reloadBtn = page.getByRole('button', { name: 'Reload' });
    this.categoriesHeader = page.getByText(/Categories \(\d+\)/);
    this.categoryNameColumnHeader = page.getByText('Category name', { exact: true });
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await super.goto(`${origin}/categories/manage`);
  }
}
