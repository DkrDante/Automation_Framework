import { test, expect } from '../../../helpers/auth-fixtures';
import { CategoryManagementPage } from '../../../pages/category-management-page';

test.describe('Settings — Category Management UI Exhaustive', { tag: ['@ui', '@regression'] }, () => {
  test('Category Manager page heading is visible', { tag: ['@smoke'] }, async ({ page }) => {
    const catPage = new CategoryManagementPage(page);
    await catPage.open();

    await expect(catPage.heading).toBeVisible();
  });

  test('Subtitle "Create and organize categories..." is visible', async ({ page }) => {
    const catPage = new CategoryManagementPage(page);
    await catPage.open();

    await expect(catPage.subTitle).toBeVisible();
  });

  test('URL resolves to /categories/manage route', async ({ page }) => {
    const catPage = new CategoryManagementPage(page);
    await catPage.open();

    await expect(page).toHaveURL(/\/categories\/manage/);
  });

  test.describe('Add New Category Section', () => {
    test('Add New Category section heading is visible', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await expect(catPage.addNewCategoryHeading).toBeVisible();
    });

    test('Category name label is visible', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await expect(catPage.categoryNameLabel).toBeVisible();
    });

    test('Category name input field is visible', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await expect(catPage.categoryNameInput).toBeVisible();
    });

    test('Sub-categories label is visible', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await expect(catPage.subCategoriesLabel).toBeVisible();
    });

    test('Sub-category input field is visible', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await expect(catPage.subCategoryNameInput).toBeVisible();
    });

    test('Save category button is visible', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await expect(catPage.saveCategoryBtn).toBeVisible();
    });

    test('Typing in Category name input updates value', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await catPage.categoryNameInput.fill('Test Category');
      await expect(catPage.categoryNameInput).toHaveValue('Test Category');
    });

    test('Typing in Sub-category input updates value', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await catPage.subCategoryNameInput.fill('Test Sub');
      await expect(catPage.subCategoryNameInput).toHaveValue('Test Sub');
    });
  });

  test.describe('Categories Table Section', () => {
    test('Categories count header is visible', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await expect(catPage.categoriesHeader).toBeVisible();
    });

    test('Reload button is visible', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await expect(catPage.reloadBtn).toBeVisible();
    });

    test('Category name column header is visible', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await expect(catPage.categoryNameColumnHeader).toBeVisible();
    });

    test('Sub-category column header is visible', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await expect(catPage.subCategoryColumnHeader).toBeVisible();
    });

    test('Actions column header is visible', async ({ page }) => {
      const catPage = new CategoryManagementPage(page);
      await catPage.open();

      await expect(catPage.actionsColumnHeader).toBeVisible();
    });
  });
});
