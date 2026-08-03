import { test, expect } from '../../../helpers/auth-fixtures';
import { AnalyticsPage } from '../../../pages/analytics-page';
import drilldownData from '../../../fixtures/analytics_experience_drilldown.json';

test.describe('Analytics UI Exhaustive', { tag: ['@ui', '@regression'] }, () => {
  test('URL resolves to /new-analytics route', { tag: ['@smoke'] }, async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.open();
    await expect(page).toHaveURL(/\/new-analytics/);
  });

  test.describe('Dashboard Header Controls', () => {
    test('Dashboard heading is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.dashboardHeading).toBeVisible();
    });

    test('Auto-refresh OFF toggle is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.autoRefreshBtn).toBeVisible();
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

    test('Auto-refresh toggle switches from OFF to ON when clicked', { tag: ['@smoke'] }, async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();

      await expect(analyticsPage.autoRefreshBtn).toHaveText(/Auto-refresh OFF/);
      await analyticsPage.autoRefreshBtn.click();

      await expect(analyticsPage.autoRefreshBtn).toHaveText(/Auto-refresh ON/);
    });

    test('Export Data button downloads a JSON file and the dashboard settles back afterwards', async ({ page }) => {
      test.setTimeout(60000);
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        analyticsPage.exportDataBtn.click(),
      ]);

      expect(download.suggestedFilename()).toMatch(/^analytics-portfolio-.*\.json$/);
      await expect(analyticsPage.totalProductsCard).toBeVisible({ timeout: 10000 });
    });

    test('Show Filters opens the filter panel and Close filters closes it', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();

      await analyticsPage.showFiltersBtn.click();
      await expect(analyticsPage.hideFiltersBtn).toBeVisible();
      await expect(analyticsPage.experiencePerformanceRadio).toBeVisible();

      await analyticsPage.closeFiltersBtn.click();
      await expect(analyticsPage.showFiltersBtn).toBeVisible();
      await expect(analyticsPage.experiencePerformanceRadio).not.toBeVisible();
    });
  });

  test.describe('Stat Cards', () => {
    test('Total Products stat card is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.totalProductsCard).toBeVisible();
    });

    test('Total Experiences stat card is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.totalExperiencesCard).toBeVisible();
    });

    test('Total Users stat card is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.totalUsersCard).toBeVisible();
    });

    test('Total Sessions stat card is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.totalSessionsCard).toBeVisible();
    });
  });

  test.describe('Session Metrics Section', () => {
    test('Session Metrics header is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.sessionMetricsHeader).toBeVisible();
    });

    test('All products dropdown is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.allProductsDropdown).toBeVisible();
    });

    test('All experiences dropdown is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.allExperiencesDropdown).toBeVisible();
    });
  });

  test.describe('Charts Section', () => {
    test('Session Trend by Device chart heading is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.sessionTrendHeading).toBeVisible();
    });

    test('Device Distribution chart heading is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.deviceDistributionHeading).toBeVisible();
    });

    test('Top 5 Experiences chart heading is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.top5ExperiencesHeading).toBeVisible();
    });

    test('Top 5 Users chart heading is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.top5UsersHeading).toBeVisible();
    });
  });

  test.describe('User Activity Log Section', () => {
    test('User Activity Log heading is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.userActivityLogHeading).toBeVisible();
    });

    test('All Activities button is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.allActivitiesBtn).toBeVisible();
    });

    test('Search activities input is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.searchActivitiesInput).toBeVisible();
    });

    test('Activity export CSV button is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.exportCsvBtn).toBeVisible();
    });

    test('Session ID column is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.sessionIdCol).toBeVisible();
    });

    test('Event Type column is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.eventTypeCol).toBeVisible();
    });

    test('Timestamp column is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.timestampCol).toBeVisible();
    });

    test('User ID column is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.userIdCol).toBeVisible();
    });

    test('Device Info column is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.deviceInfoCol).toBeVisible();
    });

    test('Hotspot Title column is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.hotspotTitleCol).toBeVisible();
    });

    test('Experience column is visible', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await expect(analyticsPage.experienceCol).toBeVisible();
    });

    test('All Activities button toggles to Share-Link Only and filters the activity list', { tag: ['@smoke'] }, async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();

      await analyticsPage.allActivitiesBtn.click();
      await expect(analyticsPage.shareLinkOnlyBtn).toBeVisible();
      await expect(page.getByText(/activities \(share-link only\)/)).toBeVisible();

      await analyticsPage.shareLinkOnlyBtn.click();
      await expect(analyticsPage.allActivitiesBtn).toBeVisible();
    });

    test('Search activities input filters the table by matching rows', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();

      const rows = page.locator('table tbody tr');
      await expect(rows.first()).toBeVisible({ timeout: 10000 });
      const initialRowCount = await rows.count();

      await analyticsPage.searchActivitiesInput.fill(drilldownData.target_experience_name);
      await expect(rows.first()).toContainText(drilldownData.target_experience_name);

      const filteredRowCount = await rows.count();
      expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount);

      await analyticsPage.searchActivitiesInput.fill('');
      await expect(rows).toHaveCount(initialRowCount);
    });

    test('Export CSV button downloads a CSV file and the log settles back afterwards', async ({ page }) => {
      test.setTimeout(60000);
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        analyticsPage.exportCsvBtn.click(),
      ]);

      expect(download.suggestedFilename()).toMatch(/^user-activity-.*\.csv$/);
      await expect(analyticsPage.userActivityLogHeading).toBeVisible({ timeout: 10000 });
    });
  });
});
