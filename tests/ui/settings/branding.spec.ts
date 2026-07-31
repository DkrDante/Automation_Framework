import { test, expect } from '../../../helpers/auth-fixtures';
import { BrandingPage } from '../../../pages/branding-page';

test.describe('Settings — Branding UI', { tag: ['@ui', '@regression'] }, () => {
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

  test('Upload logo button is visible', async ({ page }) => {
    const brandingPage = new BrandingPage(page);
    await brandingPage.open();

    await expect(brandingPage.uploadLogoBtn).toBeVisible();
  });

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
