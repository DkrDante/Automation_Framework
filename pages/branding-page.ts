import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class BrandingPage extends BasePage {
  readonly heading: Locator;
  readonly uploadLogoBtn: Locator;
  readonly removeBtn: Locator;
  readonly resetToDefaultsBtn: Locator;
  readonly saveSettingsBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Company Branding' });
    this.uploadLogoBtn = page.getByRole('button', { name: 'Upload Logo' });
    this.removeBtn = page.getByRole('button', { name: 'Remove' });
    this.resetToDefaultsBtn = page.getByRole('button', { name: 'Reset to Defaults' });
    this.saveSettingsBtn = page.getByRole('button', { name: 'Save Settings' });
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await super.goto(`${origin}/settings`);
  }
}
