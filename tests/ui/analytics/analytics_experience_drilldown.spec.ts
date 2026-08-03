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
