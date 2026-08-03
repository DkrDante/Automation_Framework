import { test, expect } from '../../../helpers/auth-fixtures';
import { AnalyticsPage } from '../../../pages/analytics-page';
import drilldownData from '../../../fixtures/analytics_experience_drilldown.json';

test.describe('Analytics Experience Drilldown', { tag: ['@ui', '@regression'] }, () => {
  test.describe('Experience Performance filter mode', () => {
    test('Experience Performance radio is visible in the filters panel', { tag: ['@smoke'] }, async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await analyticsPage.showFiltersBtn.click();

      await expect(analyticsPage.experiencePerformanceRadio).toBeVisible();
    });

    test('Selecting Experience Performance shows the Select Experience field', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await analyticsPage.showFiltersBtn.click();
      await analyticsPage.experiencePerformanceRadio.click();

      await expect(analyticsPage.selectExperienceField).toBeVisible();
    });

    test('Selecting Experience Performance changes the dashboard heading', { tag: ['@smoke'] }, async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await analyticsPage.showFiltersBtn.click();
      await analyticsPage.experiencePerformanceRadio.click();

      await expect(analyticsPage.experiencePerformanceHeading).toBeVisible();
    });

    test('Placeholder prompts to select an experience before one is chosen', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await analyticsPage.showFiltersBtn.click();
      await analyticsPage.experiencePerformanceRadio.click();

      await expect(analyticsPage.selectAnExperienceTitle).toBeVisible();
      await expect(analyticsPage.selectAnExperienceMessage).toBeVisible();
    });

    test('Searching the target experience surfaces it as an option', async ({ page }) => {
      test.setTimeout(60000);
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await analyticsPage.showFiltersBtn.click();
      await analyticsPage.experiencePerformanceRadio.click();
      await analyticsPage.selectExperienceField.click();
      await analyticsPage.experienceSearchInput.pressSequentially(drilldownData.search_term);

      await expect(page.getByText(drilldownData.target_experience_name, { exact: true })).toBeVisible({ timeout: 20000 });
    });

    test('Searching a nonsense term shows No results found', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await analyticsPage.showFiltersBtn.click();
      await analyticsPage.experiencePerformanceRadio.click();
      await analyticsPage.selectExperienceField.click();
      await analyticsPage.experienceSearchInput.pressSequentially('zzzznonexistentexperience123');

      await expect(analyticsPage.noResultsFoundText).toBeVisible();
    });

    test('Apply Filters button stays enabled and applying with no experience selected is a no-op', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await analyticsPage.showFiltersBtn.click();
      await analyticsPage.experiencePerformanceRadio.click();

      await expect(analyticsPage.applyFiltersBtn).toBeEnabled();

      await analyticsPage.applyFiltersBtn.click();

      await expect(analyticsPage.selectAnExperienceTitle).toBeVisible();
    });
  });

  test.describe('Switching back to Dashboard mode', () => {
    test('Selecting Dashboard mode after Experience Performance reverts to the org-wide dashboard', { tag: ['@smoke'] }, async ({ page }) => {
      test.setTimeout(60000);
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await analyticsPage.showFiltersBtn.click();
      await analyticsPage.experiencePerformanceRadio.click();

      await analyticsPage.dashboardModeRadio.click();

      await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 10000 });
      await expect(analyticsPage.dashboardModeRadio).toBeChecked();
      await expect(analyticsPage.experiencePerformanceRadio).not.toBeChecked();
      await expect(analyticsPage.totalProductsCard).toBeVisible({ timeout: 10000 });
      await expect(analyticsPage.totalExperiencesCard).toBeVisible();
      await expect(analyticsPage.sessionMetricsHeader).toBeVisible();
    });
  });

  test.describe('Reset Filters behavior', () => {
    test('Reset Filters does not clear an already-applied experience or revert the mode', async ({ page }) => {
      test.setTimeout(60000);
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await analyticsPage.selectExperienceForDrilldown(drilldownData.target_experience_name, drilldownData.search_term);

      await analyticsPage.resetFiltersBtn.click();

      await expect(analyticsPage.experiencePerformanceRadio).toBeChecked();
      await expect(analyticsPage.dashboardModeRadio).not.toBeChecked();
      await expect(analyticsPage.activeFiltersText).toBeVisible();
      await expect(page.getByText(drilldownData.target_experience_name, { exact: true })).toBeVisible();
      await expect(analyticsPage.experienceStatCard(drilldownData.drilldown_stat_cards[0])).toBeVisible();
    });

    test('Reset Filters clears an unapplied draft change back to its default', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.open();
      await analyticsPage.showFiltersBtn.click();

      await analyticsPage.ninetyDaysRangeBtn.click();
      await expect(analyticsPage.ninetyDaysRangeBtn).toHaveClass(/bg-yellow/);

      await analyticsPage.resetFiltersBtn.click();

      await expect(analyticsPage.thirtyDaysRangeBtn).toHaveClass(/bg-yellow/);
    });
  });

  test.describe('Drilldown results after selecting an experience', () => {
    for (const card of drilldownData.drilldown_stat_cards) {
      test(`${card} stat card is visible after selecting the target experience`, { tag: ['@smoke'] }, async ({ page }) => {
        test.setTimeout(60000);
        const analyticsPage = new AnalyticsPage(page);
        await analyticsPage.open();
        await analyticsPage.selectExperienceForDrilldown(drilldownData.target_experience_name, drilldownData.search_term);

        await expect(analyticsPage.experienceStatCard(card)).toBeVisible();
      });
    }
  });
});
