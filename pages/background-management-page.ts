import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class BackgroundManagementPage extends BasePage {
  readonly heading: Locator;
  readonly uploadHdriBtn: Locator;
  readonly reloadBtn: Locator;
  readonly hdriCatalogHeader: Locator;
  readonly nameColumnHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'HDRI Manager' });
    this.uploadHdriBtn = page.getByRole('button', { name: 'Upload HDRI' });
    this.reloadBtn = page.getByRole('button', { name: 'Reload' });
    this.hdriCatalogHeader = page.getByText(/HDRI Catalog \(\d+\)/);
    this.nameColumnHeader = page.getByText('Name', { exact: true });
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await super.goto(`${origin}/hdri/manage`);
  }
}
