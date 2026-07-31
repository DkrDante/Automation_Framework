import { test, expect } from '../../../helpers/auth-fixtures';
import { MaterialManagementPage } from '../../../pages/material-management-page';

test.describe('Settings — Material Management UI', { tag: ['@ui', '@regression'] }, () => {
  test('Material Management page heading is visible', { tag: ['@smoke'] }, async ({ page }) => {
    const matPage = new MaterialManagementPage(page);
    await matPage.open();

    await expect(matPage.heading).toBeVisible();
  });

  test('URL resolves to /material-presets/manage route', async ({ page }) => {
    const matPage = new MaterialManagementPage(page);
    await matPage.open();

    await expect(page).toHaveURL(/\/material-presets\/manage/);
  });

  test('Reload button is visible', async ({ page }) => {
    const matPage = new MaterialManagementPage(page);
    await matPage.open();

    await expect(matPage.reloadBtn).toBeVisible();
  });

  test('Materials count header is visible', async ({ page }) => {
    const matPage = new MaterialManagementPage(page);
    await matPage.open();

    await expect(matPage.materialsHeader).toBeVisible();
  });
});
