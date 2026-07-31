import { test, expect } from '../../../helpers/auth-fixtures';
import { MaterialManagementPage } from '../../../pages/material-management-page';

test.describe('Settings — Material Management UI Exhaustive', { tag: ['@ui', '@regression'] }, () => {
  test('Material Management page heading is visible', { tag: ['@smoke'] }, async ({ page }) => {
    const matPage = new MaterialManagementPage(page);
    await matPage.open();

    await expect(matPage.heading).toBeVisible();
  });

  test('Subtitle describing PBR materials purpose is visible', async ({ page }) => {
    const matPage = new MaterialManagementPage(page);
    await matPage.open();

    await expect(matPage.subTitle).toBeVisible();
  });

  test('URL resolves to /material-presets/manage route', async ({ page }) => {
    const matPage = new MaterialManagementPage(page);
    await matPage.open();

    await expect(page).toHaveURL(/\/material-presets\/manage/);
  });

  test('Add New button is visible', async ({ page }) => {
    const matPage = new MaterialManagementPage(page);
    await matPage.open();

    await expect(matPage.addNewBtn).toBeVisible();
  });

  test('Materials count header is visible', async ({ page }) => {
    const matPage = new MaterialManagementPage(page);
    await matPage.open();

    await expect(matPage.materialsHeader).toBeVisible();
  });

  test('Reload button is visible', async ({ page }) => {
    const matPage = new MaterialManagementPage(page);
    await matPage.open();

    await expect(matPage.reloadBtn).toBeVisible();
  });
});
