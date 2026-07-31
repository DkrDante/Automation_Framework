import { test, expect } from '../../../helpers/auth-fixtures';
import { BackgroundManagementPage } from '../../../pages/background-management-page';

test.describe('Settings — Background Management UI', { tag: ['@ui', '@regression'] }, () => {
  test('HDRI Manager page heading is visible', { tag: ['@smoke'] }, async ({ page }) => {
    const bgPage = new BackgroundManagementPage(page);
    await bgPage.open();

    await expect(bgPage.heading).toBeVisible();
  });

  test('URL resolves to /hdri/manage route', async ({ page }) => {
    const bgPage = new BackgroundManagementPage(page);
    await bgPage.open();

    await expect(page).toHaveURL(/\/hdri\/manage/);
  });

  test('Upload HDRI button is visible', async ({ page }) => {
    const bgPage = new BackgroundManagementPage(page);
    await bgPage.open();

    await expect(bgPage.uploadHdriBtn).toBeVisible();
  });

  test('Reload button is visible', async ({ page }) => {
    const bgPage = new BackgroundManagementPage(page);
    await bgPage.open();

    await expect(bgPage.reloadBtn).toBeVisible();
  });

  test('HDRI catalog count header is visible', async ({ page }) => {
    const bgPage = new BackgroundManagementPage(page);
    await bgPage.open();

    await expect(bgPage.hdriCatalogHeader).toBeVisible();
  });
});
