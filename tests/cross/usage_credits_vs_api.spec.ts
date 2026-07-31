import { test, expect } from '../../helpers/cross-fixtures';
import { UsagePage } from '../../pages/usage-page';

test.describe('Cross — Usage UI vs Credits API', { tag: ['@cross', '@regression'] }, () => {
  let summary: any;
  let breakdown: any;

  test.beforeAll(async ({ dashboardApi }) => {
    summary = await dashboardApi.getCreditsSummary('current_month');
    breakdown = await dashboardApi.getCreditsBreakdown('user', 'current_month');
  });

  test.describe('Credits API Schema Validation', () => {
    test('credits_api_totals_schema_is_valid', () => {
      expect(summary).toHaveProperty('totals');
      expect(typeof summary.totals.credits).toBe('number');
      expect(summary.totals.credits).toBeGreaterThanOrEqual(0);
      expect(summary).toHaveProperty('quota');
      expect(summary.quota).toHaveProperty('isSet');
      expect(typeof summary.quota.isSet).toBe('boolean');
      expect(summary).toHaveProperty('byUser');
      expect(Array.isArray(summary.byUser)).toBe(true);
      expect(summary).toHaveProperty('tenantTotals');
      expect(typeof summary.tenantTotals.credits).toBe('number');
    });

    test('credits_api_byuser_every_row_has_required_fields', () => {
      for (const user of summary.byUser) {
        expect(typeof user.userId).toBe('string');
        expect(typeof user.credits).toBe('number');
        expect(user.credits).toBeGreaterThanOrEqual(0);
        expect(typeof user.runCount).toBe('number');
      }
    });

    test('credits_api_breakdown_schema_is_valid', () => {
      expect(breakdown).toHaveProperty('dimension');
      expect(breakdown.dimension).toBe('user');
      expect(breakdown).toHaveProperty('rows');
      expect(Array.isArray(breakdown.rows)).toBe(true);
      for (const row of breakdown.rows) {
        expect(typeof row.id).toBe('string');
        expect(typeof row.label).toBe('string');
        expect(typeof row.credits).toBe('number');
        expect(row.credits).toBeGreaterThanOrEqual(0);
      }
    });

    test('credits_breakdown_totals_sum_matches_api_total', () => {
      const breakdownSum = breakdown.rows.reduce((acc: number, row: any) => acc + row.credits, 0);
      // Allow floating point tolerance of 1 credit
      expect(Math.abs(breakdownSum - summary.totals.credits)).toBeLessThanOrEqual(1);
    });

    test('credits_byUser_sum_matches_tenantTotals', () => {
      const byUserSum = summary.byUser.reduce((acc: number, u: any) => acc + u.credits, 0);
      expect(Math.abs(byUserSum - summary.tenantTotals.credits)).toBeLessThanOrEqual(1);
    });
  });

  test.describe('Credits UI vs API Cross Verification', () => {
    test('credits_consumed_ui_matches_api_totals', async ({ page }) => {
      const apiCreditsRounded = Math.round(summary.totals.credits);

      const usagePage = new UsagePage(page);
      await usagePage.open();

      // Get the numeric value that follows the "Credits Consumed" label
      // It is the sibling text node rendered as a large number in the card
      const creditsValueLocator = page
        .locator('text=/^[\\d,]+$/')
        .filter({ hasText: /^[0-9,]+$/ })
        .first();
      const rawText = await creditsValueLocator.innerText();
      const uiCredits = parseInt(rawText.replace(/,/g, ''), 10);

      expect(uiCredits).toBe(apiCreditsRounded);
    });

    test('credits_breakdown_by_user_top_email_visible_in_table', async ({ page }) => {
      const topUser: string = breakdown.rows[0].label;

      const usagePage = new UsagePage(page);
      await usagePage.open();

      // Top user email appears in the first data row of the Breakdown table
      const firstRowEmail = page.getByText(topUser, { exact: true });
      await expect(firstRowEmail).toBeVisible();
    });
  });
});
