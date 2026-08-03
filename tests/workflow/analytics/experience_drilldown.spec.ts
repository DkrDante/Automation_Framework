import { test, expect } from '../../../helpers/cross-fixtures';
import { AnalyticsPage } from '../../../pages/analytics-page';
import drilldownData from '../../../fixtures/analytics_experience_drilldown.json';

test.use({ video: 'on' });

// Unlike the other workflow specs, this journey is read-only — it only drives filters
// on the analytics dashboard and creates no server-side resource, so there is nothing
// for an afterEach to clean up.
test.describe('Workflow — Analytics: drill down from the org-wide dashboard into one experience and back', { tag: ['@workflow', '@regression'] }, () => {
  test('switch to Experience Performance, select an experience, verify its stats against the API, then return to Dashboard', async ({ page, dashboardApi }) => {
    // Each filter change re-queries the live analytics backend; the experience search
    // alone regularly takes ~20s before its options settle.
    test.setTimeout(180000);

    const analyticsPage = new AnalyticsPage(page);
    let targetExperienceId: string;

    await test.step('Open the analytics dashboard in its default org-wide mode', async () => {
      await analyticsPage.open();
      await expect(page.getByRole('heading', { name: drilldownData.org_wide_heading, exact: true })).toBeVisible({ timeout: 30000 });
    });

    await test.step('Open the filters panel', async () => {
      await analyticsPage.showFiltersBtn.click();
      await expect(analyticsPage.experiencePerformanceRadio).toBeVisible();
    });

    await test.step('Reset Filters discards an unapplied draft change (90 Days) back to the 30 Days default', async () => {
      await analyticsPage.ninetyDaysRangeBtn.click();
      await expect(analyticsPage.ninetyDaysRangeBtn).toHaveClass(/bg-yellow/);

      await analyticsPage.resetFiltersBtn.click();

      await expect(analyticsPage.thirtyDaysRangeBtn).toHaveClass(/bg-yellow/);
    });

    await test.step('Switch the filter mode to Experience Performance', async () => {
      await analyticsPage.experiencePerformanceRadio.click();
      await expect(analyticsPage.selectExperienceField).toBeVisible();
      await expect(analyticsPage.experiencePerformanceHeading).toBeVisible();
    });

    await test.step('Before any experience is chosen, the dashboard prompts for one', async () => {
      await expect(analyticsPage.selectAnExperienceTitle).toBeVisible();
      await expect(analyticsPage.selectAnExperienceMessage).toBeVisible();
    });

    await test.step('Apply Filters stays enabled, and applying with nothing selected is a no-op', async () => {
      await expect(analyticsPage.applyFiltersBtn).toBeEnabled();
      await analyticsPage.applyFiltersBtn.click();

      await expect(analyticsPage.selectAnExperienceTitle).toBeVisible();
    });

    await test.step('Searching a nonsense term shows "No results found"', async () => {
      await analyticsPage.selectExperienceField.click();
      await analyticsPage.experienceSearchInput.pressSequentially('zzzznonexistentexperience123');

      await expect(analyticsPage.noResultsFoundText).toBeVisible();
    });

    await test.step(`Searching "${drilldownData.search_term}" surfaces the target experience as an option`, async () => {
      await analyticsPage.experienceSearchInput.fill('');
      await analyticsPage.experienceSearchInput.pressSequentially(drilldownData.search_term);

      await expect(page.getByText(drilldownData.target_experience_name, { exact: true })).toBeVisible({ timeout: 20000 });
    });

    await test.step('Select the target experience and apply the filter', async () => {
      await page.getByText(drilldownData.target_experience_name, { exact: true }).click();
      await analyticsPage.applyFiltersBtn.click();

      await expect(analyticsPage.activeFiltersText).toBeVisible();
    });

    await test.step('Every drilldown stat card is rendered', async () => {
      for (const card of drilldownData.drilldown_stat_cards) {
        await expect(analyticsPage.experienceStatCard(card)).toBeVisible();
      }
    });

    await test.step('Cross-verify with API — the rendered stats match /api/new-analytics/dashboard for this experience', async () => {
      const filtersResponse = await dashboardApi.getAnalyticsFilters();
      const targetExperience = filtersResponse.data.experiences.find(
        (exp: any) => exp.name.trim() === drilldownData.target_experience_name
      );
      expect(targetExperience, `"${drilldownData.target_experience_name}" is missing from the analytics filter options`).toBeTruthy();
      targetExperienceId = targetExperience.id;

      const dashboard = await dashboardApi.getAnalyticsDashboard(targetExperienceId);
      expect(dashboard.data.filters.experienceId).toBe(targetExperienceId);
      expect(dashboard.data.experiences.totalExperiences).toBe(1);

      await expect(analyticsPage.experienceStatValue('Total Unique Users'))
        .toHaveText(String(dashboard.data.userMetrics.totalUniqueUsers));
      await expect(analyticsPage.experienceStatValue('Total Duration'))
        .toHaveText(dashboard.data.sessionMetrics.totalDuration);
      // Active Sessions counts sessions live right now on a shared environment — it
      // moved 0 → 1 between two runs minutes apart. The UI rendered its value when the
      // filter was applied and the API is queried seconds later, so an exact
      // cross-check is a race by construction; assert the shape instead.
      await expect(analyticsPage.experienceStatValue('Active Sessions')).toHaveText(/^\d+$/);
    });

    await test.step('Reset Filters leaves the already-applied experience and mode intact', async () => {
      await analyticsPage.resetFiltersBtn.click();

      await expect(analyticsPage.experiencePerformanceRadio).toBeChecked();
      await expect(analyticsPage.dashboardModeRadio).not.toBeChecked();
      await expect(analyticsPage.activeFiltersText).toBeVisible();
      // The Active Filters summary identifies the experience by id, not by name. Match
      // on that: once the drilldown loads, the User Activity Log renders a row per
      // event, so the experience *name* resolves to a dozen elements page-wide.
      await expect(page.getByText(`Experience: ${targetExperienceId}`)).toBeVisible();
      await expect(analyticsPage.experienceStatCard(drilldownData.drilldown_stat_cards[0])).toBeVisible();
    });

    await test.step('Switching back to Dashboard mode restores the org-wide dashboard', async () => {
      await analyticsPage.dashboardModeRadio.click();

      await expect(page.getByRole('heading', { name: drilldownData.org_wide_heading, exact: true })).toBeVisible({ timeout: 10000 });
      await expect(analyticsPage.dashboardModeRadio).toBeChecked();
      await expect(analyticsPage.experiencePerformanceRadio).not.toBeChecked();
      await expect(analyticsPage.totalProductsCard).toBeVisible({ timeout: 10000 });
      await expect(analyticsPage.totalExperiencesCard).toBeVisible();
      await expect(analyticsPage.sessionMetricsHeader).toBeVisible();
    });
  });
});
