import { test, expect } from '../../../helpers/auth-fixtures';
import { UsagePage } from '../../../pages/usage-page';

test.describe('Settings — Usage UI Exhaustive', { tag: ['@ui', '@regression'] }, () => {

  test('Usage page heading is visible', { tag: ['@smoke'] }, async ({ page }) => {
    const usagePage = new UsagePage(page);
    await usagePage.open();
    await expect(usagePage.heading).toBeVisible();
  });

  test('URL resolves to /usage route', async ({ page }) => {
    const usagePage = new UsagePage(page);
    await usagePage.open();
    await expect(page).toHaveURL(/\/usage/);
  });

  test.describe('Tab Navigation', () => {
    test('Credits tab is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.creditsTab).toBeVisible();
    });

    test('Storage tab is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.storageTab).toBeVisible();
    });

    test('Views tab is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.viewsTab).toBeVisible();
    });
  });

  test.describe('Credits Consumption Card', () => {
    test('Credits Consumption heading is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.creditsConsumptionHeading).toBeVisible();
    });

    test('Tenant-wide AI workflow usage subtext is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.tenantSubtext).toBeVisible();
    });

    test('Allocation label is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.allocationLabel).toBeVisible();
    });

    test('Credits Consumed label is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.creditsConsumedLabel).toBeVisible();
    });

    test('Remaining Balance label is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.remainingBalanceLabel).toBeVisible();
    });
  });

  test.describe('Breakdown Section', () => {
    test('Breakdown heading is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.breakdownHeading).toBeVisible();
    });

    test('By user filter button is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.byUserBtn).toBeVisible();
    });

    test('By product filter button is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.byProductBtn).toBeVisible();
    });

    test('By experience filter button is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.byExperienceBtn).toBeVisible();
    });

    test('Export CSV button is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.exportCsvBtn).toBeVisible();
    });

    test('User column header is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.userColumnHeader).toBeVisible();
    });

    test('% of total column header is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.percentColumnHeader).toBeVisible();
    });

    test('Credits column header is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.creditsColumnHeader).toBeVisible();
    });
  });

  test.describe('Usage Trend Section', () => {
    test('Usage trend heading is visible', async ({ page }) => {
      const usagePage = new UsagePage(page);
      await usagePage.open();
      await expect(usagePage.usageTrendHeading).toBeVisible();
    });
  });
});
