import { test, expect } from '../../../helpers/auth-fixtures';
import { BrandingPage } from '../../../pages/branding-page';

test.describe('Settings — Company Branding UI Exhaustive', { tag: ['@ui', '@regression'] }, () => {
  test('Company Branding page heading is visible', { tag: ['@smoke'] }, async ({ page }) => {
    const brandingPage = new BrandingPage(page);
    await brandingPage.open();

    await expect(brandingPage.heading).toBeVisible();
  });

  test('URL resolves to /settings route', async ({ page }) => {
    const brandingPage = new BrandingPage(page);
    await brandingPage.open();

    await expect(page).toHaveURL(/\/settings/);
  });

  test.describe('Company Logo Section', () => {
    test('Company Logo label is visible', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await expect(brandingPage.companyLogoLabel).toBeVisible();
    });

    test('Upload logo button is visible', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await expect(brandingPage.uploadLogoBtn).toBeVisible();
    });

    test('Remove logo button is visible', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await expect(brandingPage.removeBtn).toBeVisible();
    });

    test('Logo file upload helper text is visible', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await expect(brandingPage.logoHelperText).toBeVisible();
    });
  });

  test.describe('Company Name Section', () => {
    test('Company Name label is visible', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await expect(brandingPage.companyNameLabel).toBeVisible();
    });

    test('Company Name input field with placeholder is visible', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await expect(brandingPage.companyNameInput).toBeVisible();
    });

    test('Character count hint is visible', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await expect(brandingPage.charCountHint).toBeVisible();
    });

    test('Typing in Company Name input updates the input value', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await brandingPage.companyNameInput.fill('Test Company');
      await expect(brandingPage.companyNameInput).toHaveValue('Test Company');
    });
  });

  test.describe('Company Color Section', () => {
    test('Company Color label is visible', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await expect(brandingPage.companyColorLabel).toBeVisible();
    });

    test('Company Color hex input field is visible', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await expect(brandingPage.companyColorInput).toBeVisible();
    });

    test('Company Color helper text is visible', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await expect(brandingPage.colorHelperText).toBeVisible();
    });
  });

  test.describe('Action Buttons', () => {
    test('Reset to defaults button is visible', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await expect(brandingPage.resetToDefaultsBtn).toBeVisible();
    });

    test('Save settings button is visible', async ({ page }) => {
      const brandingPage = new BrandingPage(page);
      await brandingPage.open();

      await expect(brandingPage.saveSettingsBtn).toBeVisible();
    });
  });
});
