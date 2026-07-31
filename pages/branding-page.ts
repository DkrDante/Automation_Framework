import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class BrandingPage extends BasePage {
  readonly heading: Locator;
  readonly companyLogoLabel: Locator;
  readonly uploadLogoBtn: Locator;
  readonly removeBtn: Locator;
  readonly logoHelperText: Locator;
  readonly companyNameLabel: Locator;
  readonly companyNameInput: Locator;
  readonly charCountHint: Locator;
  readonly companyColorLabel: Locator;
  readonly companyColorInput: Locator;
  readonly colorHelperText: Locator;
  readonly resetToDefaultsBtn: Locator;
  readonly saveSettingsBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Company Branding' });
    this.companyLogoLabel = page.getByText('Company Logo', { exact: true });
    this.uploadLogoBtn = page.getByRole('button', { name: 'Upload Logo' });
    this.removeBtn = page.getByRole('button', { name: 'Remove' });
    this.logoHelperText = page.getByText('PNG, JPG up to 2MB. Recommended: 200x200px');
    this.companyNameLabel = page.getByText('Company Name', { exact: true });
    this.companyNameInput = page.getByPlaceholder('Enter your company name');
    this.charCountHint = page.getByText(/\d+\/100 characters/);
    this.companyColorLabel = page.getByText('Company Color', { exact: true });
    this.companyColorInput = page.locator('input[value^="#"], input[placeholder*="#"]');
    this.colorHelperText = page.getByText('This color will be used in your shared experiences');
    this.resetToDefaultsBtn = page.getByRole('button', { name: 'Reset to Defaults' });
    this.saveSettingsBtn = page.getByRole('button', { name: 'Save Settings' });
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await super.goto(`${origin}/settings`);
  }
}
