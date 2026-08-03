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
  readonly logoPreview: Locator;
  readonly fileInput: Locator;

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
    this.logoPreview = page.locator('img[alt="Uploaded company logo preview"]');
    this.fileInput = page.locator('input[type="file"]').first();
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await super.goto(`${origin}/settings`);
  }

  async uploadLogo(filePath: string) {
    await this.uploadLogoBtn.click();
    await this.fileInput.setInputFiles(filePath);
    await this.logoPreview.waitFor({ state: 'visible' });
  }

  async removeLogo() {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.removeBtn.click();
  }

  async saveAndConfirm() {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/api/settings') && response.request().method() === 'PUT'
    );
    await this.saveSettingsBtn.click();
    const response = await responsePromise;
    const body = await response.json();
    return { response, body };
  }
}
