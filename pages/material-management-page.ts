import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class MaterialManagementPage extends BasePage {
  readonly heading: Locator;
  readonly subTitle: Locator;
  readonly addNewBtn: Locator;
  readonly materialsHeader: Locator;
  readonly reloadBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Material Management' });
    this.subTitle = page.getByText('Upload, organize, and manage PBR (Physically-Based Rendering) materials to customize the look and feel of your 3D models.');
    this.addNewBtn = page.getByRole('button', { name: 'Add New' });
    this.materialsHeader = page.getByText(/Materials \(\d+\)/);
    this.reloadBtn = page.getByRole('button', { name: 'Reload' });
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await super.goto(`${origin}/material-presets/manage`);
  }
}
