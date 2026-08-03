import { test, expect } from '../../../helpers/auth-fixtures';
import { BackgroundManagementPage } from '../../../pages/background-management-page';

test.describe('Settings — Background Management UI Exhaustive', { tag: ['@ui', '@regression'] }, () => {
  test('HDRI Manager page heading is visible', { tag: ['@smoke'] }, async ({ page }) => {
    const bgPage = new BackgroundManagementPage(page);
    await bgPage.open();

    await expect(bgPage.heading).toBeVisible();
  });

  test('Subtitle describing HDRI purpose is visible', async ({ page }) => {
    const bgPage = new BackgroundManagementPage(page);
    await bgPage.open();

    await expect(bgPage.subTitle).toBeVisible();
  });

  test('URL resolves to /hdri/manage route', async ({ page }) => {
    const bgPage = new BackgroundManagementPage(page);
    await bgPage.open();

    await expect(page).toHaveURL(/\/hdri\/manage/);
  });

  test.describe('Add New HDRI Section', () => {
    test('Add New HDRI section heading is visible', async ({ page }) => {
      const bgPage = new BackgroundManagementPage(page);
      await bgPage.open();

      await expect(bgPage.addNewHdriHeading).toBeVisible();
    });

    test('Display name label is visible', async ({ page }) => {
      const bgPage = new BackgroundManagementPage(page);
      await bgPage.open();

      await expect(bgPage.displayNameLabel).toBeVisible();
    });

    test('Choose HDRI button is visible', async ({ page }) => {
      const bgPage = new BackgroundManagementPage(page);
      await bgPage.open();

      await expect(bgPage.chooseHdriBtn).toBeVisible();
    });

    test('File type helper text is visible', async ({ page }) => {
      const bgPage = new BackgroundManagementPage(page);
      await bgPage.open();

      await expect(bgPage.fileHelperText).toBeVisible();
    });

    test('Upload HDRI submit button is visible', async ({ page }) => {
      const bgPage = new BackgroundManagementPage(page);
      await bgPage.open();

      await expect(bgPage.uploadHdriBtn).toBeVisible();
    });
  });

  test.describe('HDRI Catalog Table Section', () => {
    test('HDRI catalog count header is visible', async ({ page }) => {
      const bgPage = new BackgroundManagementPage(page);
      await bgPage.open();

      await expect(bgPage.hdriCatalogHeader).toBeVisible();
    });

    test('Reload button is visible', async ({ page }) => {
      const bgPage = new BackgroundManagementPage(page);
      await bgPage.open();

      await expect(bgPage.reloadBtn).toBeVisible();
    });

    test('Name column header is visible', async ({ page }) => {
      const bgPage = new BackgroundManagementPage(page);
      await bgPage.open();

      await expect(bgPage.nameColumnHeader).toBeVisible();
    });

    test('File Size (MB) column header is visible', async ({ page }) => {
      const bgPage = new BackgroundManagementPage(page);
      await bgPage.open();

      await expect(bgPage.fileSizeColumnHeader).toBeVisible();
    });

    test('Updated By column header is visible', async ({ page }) => {
      const bgPage = new BackgroundManagementPage(page);
      await bgPage.open();

      await expect(bgPage.updatedByColumnHeader).toBeVisible();
    });

    test('Actions column header is visible', async ({ page }) => {
      const bgPage = new BackgroundManagementPage(page);
      await bgPage.open();

      await expect(bgPage.actionsColumnHeader).toBeVisible();
    });
  });
});
