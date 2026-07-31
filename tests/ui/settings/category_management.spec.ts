import { test, expect } from '../../../helpers/auth-fixtures';
import { CategoryManagementPage } from '../../../pages/category-management-page';

test.describe('Settings — Category Management UI', { tag: ['@ui', '@regression'] }, () => {
  test('Category Manager page heading is visible', { tag: ['@smoke'] }, async ({ page }) => {
    const catPage = new CategoryManagementPage(page);
    await catPage.open();

    await expect(catPage.heading).toBeVisible();
  });

  test('URL resolves to /categories/manage route', async ({ page }) => {
    const catPage = new CategoryManagementPage(page);
    await catPage.open();

    await expect(page).toHaveURL(/\/categories\/manage/);
  });

  test('Save category button is visible', async ({ page }) => {
    const catPage = new CategoryManagementPage(page);
    await catPage.open();

    await expect(catPage.saveCategoryBtn).toBeVisible();
  });

  test('Reload button is visible', async ({ page }) => {
    const catPage = new CategoryManagementPage(page);
    await catPage.open();

    await expect(catPage.reloadBtn).toBeVisible();
  });

  test('Categories count header is visible', async ({ page }) => {
    const catPage = new CategoryManagementPage(page);
    await catPage.open();

    await expect(catPage.categoriesHeader).toBeVisible();
  });
});
