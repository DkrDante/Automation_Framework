import { test, expect } from '../../../helpers/auth-fixtures';
import { HomePage } from '../../../pages/home-page';
import homeData from '../../../fixtures/home.json';

test.describe('Home', { tag: ['@ui'] }, () => {
  test.describe('Page basics', () => {
    test('Title contains SatoriXR', { tag: ['@smoke'] }, async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.open();

      await expect(page).toHaveTitle(/SatoriXR/);
    });

    test('URL resolves to home route', { tag: ['@smoke'] }, async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.open();

      await expect(page).toHaveURL(new RegExp(homeData.dashboard_url_pattern));
    });

    test('No error banners on load', { tag: ['@regression'] }, async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.open();

      await expect(homePage.errorBanner).toHaveCount(0);
    });
  });

  test.describe('Overview section', () => {
    test('Overview heading is visible', { tag: ['@smoke'] }, async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.open();

      await expect(homePage.overviewHeading).toBeVisible();
    });

    test('Overview heading text is exact', { tag: ['@regression'] }, async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.open();

      await expect(homePage.overviewHeading).toHaveText(homeData.overview_heading);
    });
  });

  test.describe('Summary cards', () => {
    for (const cardTitle of homeData.expected_cards) {
      test(`${cardTitle} card is visible`, { tag: ['@smoke'] }, async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.open();

        // Cards load asynchronously after the Overview heading — give them room.
        await expect(homePage.overviewCard(cardTitle)).toBeVisible({ timeout: 15000 });
      });

      test(`${cardTitle} card displays a number`, { tag: ['@regression'] }, async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.open();

        await expect(homePage.overviewCard(cardTitle)).toContainText(/\d+/, { timeout: 15000 });
      });
    }
  });

  test.describe('Sidebar navigation', () => {
    for (const navLabel of homeData.expected_nav_items) {
      test(`${navLabel} nav item is visible`, { tag: ['@smoke'] }, async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.open();

        await expect(homePage.navItem(navLabel).first()).toBeVisible();
      });
    }

    for (const subNavLabel of homeData.expected_sub_nav_items) {
      test(`Settings sub nav reveals ${subNavLabel}`, { tag: ['@regression'] }, async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.open();
        await homePage.openSettingsSubNav();

        await expect(homePage.subNavItem(subNavLabel)).toBeVisible();
      });
    }
  });
});
