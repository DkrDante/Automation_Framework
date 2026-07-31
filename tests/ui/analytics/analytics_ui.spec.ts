import { test, expect } from '../../../helpers/auth-fixtures';
import { AnalyticsPage } from '../../../pages/analytics-page';

test.describe('Analytics UI', { tag: ['@ui', '@regression'] }, () => {
  test('URL resolves to /new-analytics route', { tag: ['@smoke'] }, async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.open();

    await expect(page).toHaveURL(/\/new-analytics/);
  });

  test('Export Data button is visible', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.open();

    await expect(analyticsPage.exportDataBtn).toBeVisible();
  });

  test('Show Filters button is visible', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.open();

    await expect(analyticsPage.showFiltersBtn).toBeVisible();
  });

  test('Session Metrics header is visible', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.open();

    await expect(analyticsPage.sessionMetricsHeader).toBeVisible();
  });
});
