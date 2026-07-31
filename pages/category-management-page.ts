import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class CategoryManagementPage extends BasePage {
  readonly heading: Locator;
  readonly subTitle: Locator;
  readonly addNewCategoryHeading: Locator;
  readonly categoryNameLabel: Locator;
  readonly categoryNameInput: Locator;
  readonly subCategoriesLabel: Locator;
  readonly subCategoryNameInput: Locator;
  readonly saveCategoryBtn: Locator;
  readonly categoriesHeader: Locator;
  readonly reloadBtn: Locator;
  readonly categoryNameColumnHeader: Locator;
  readonly subCategoryColumnHeader: Locator;
  readonly actionsColumnHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Category Manager' });
    this.subTitle = page.getByText('Create and organize categories for the asset library.');
    this.addNewCategoryHeading = page.getByText('Add New Category', { exact: true });
    this.categoryNameLabel = page.getByText('Category name', { exact: true }).first();
    this.categoryNameInput = page.getByPlaceholder('Enter category name');
    this.subCategoriesLabel = page.getByText(/Sub-categories \(\d+\)/);
    this.subCategoryNameInput = page.getByPlaceholder('Enter a sub-category name');
    this.saveCategoryBtn = page.getByRole('button', { name: 'Save category' });
    this.categoriesHeader = page.getByText(/Categories \(\d+\)/);
    this.reloadBtn = page.getByRole('button', { name: 'Reload' });
    this.categoryNameColumnHeader = page.getByRole('columnheader', { name: 'Category name' });
    this.subCategoryColumnHeader = page.getByRole('columnheader', { name: 'Sub-category' });
    this.actionsColumnHeader = page.getByRole('columnheader', { name: 'Actions' });
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await super.goto(`${origin}/categories/manage`);
  }
}
