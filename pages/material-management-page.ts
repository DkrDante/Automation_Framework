import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class MaterialManagementPage extends BasePage {
  readonly heading: Locator;
  readonly reloadBtn: Locator;
  readonly materialsHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Material Management' });
    this.reloadBtn = page.getByRole('button', { name: 'Reload' });
    this.materialsHeader = page.getByText(/Materials \(\d+\)/);
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await super.goto(`${origin}/material-presets/manage`);
  }
}
