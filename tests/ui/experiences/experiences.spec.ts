import { test, expect } from '../../../helpers/auth-fixtures';
import { ExperiencePage } from '../../../pages/experiences-page';
import experiencesData from '../../../fixtures/experiences.json';

const search = experiencesData.search;

test.describe('Experiences', { tag: ['@ui'] }, () => {
  test.describe('Page basics', () => {
    test('Title contains SatoriXR', { tag: ['@smoke'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();

      await expect(page).toHaveTitle(/SatoriXR/);
    });

    test('URL resolves to experiences route', { tag: ['@smoke'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();

      await expect(page).toHaveURL(new RegExp(experiencesData.experiences_url_pattern));
    });

    test('Heading is visible', { tag: ['@smoke'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();

      await expect(experiencePage.experiencesHeading).toBeVisible();
    });

    test('Heading text is exact', { tag: ['@regression'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();

      await expect(experiencePage.experiencesHeading).toHaveText(experiencesData.page_heading);
    });

    test('Subheading is visible', { tag: ['@smoke'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();

      await expect(experiencePage.experiencesSubheading).toBeVisible();
    });

    test('Subheading text is exact', { tag: ['@regression'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();

      await expect(experiencePage.experiencesSubheading).toHaveText(
        experiencesData.page_subheading
      );
    });

    test('Create Experience button is visible', { tag: ['@smoke'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();

      await expect(experiencePage.createExperienceButton).toBeVisible();
      await expect(experiencePage.createExperienceButton).toHaveAttribute(
        'href',
        experiencesData.create_experience_href
      );
    });
  });

  test.describe('Toolbar controls', () => {
    test('Search input shows its placeholder', { tag: ['@smoke'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();

      await expect(experiencePage.searchInput).toBeVisible();
      await expect(experiencePage.searchInput).toHaveAttribute(
        'placeholder',
        experiencesData.search_placeholder
      );
    });

    test('Sort dropdown offers every option', { tag: ['@regression'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();

      expect(await experiencePage.sortOptionLabels()).toEqual(experiencesData.sort_options);
    });

    test('Status dropdown offers every option', { tag: ['@regression'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();

      expect(await experiencePage.statusOptionLabels()).toEqual(experiencesData.status_options);
    });

  });

  test.describe('Search', () => {
    test(`Searching "${search.term}" narrows the grid to ${search.expected_title}`, { tag: ['@smoke'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();
      await experiencePage.search(search.term);

      await expect(async () => {
        expect(await experiencePage.visibleCardTitles()).toEqual([search.expected_title]);
      }).toPass();
    });

    test('Search is case-insensitive', { tag: ['@regression'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();
      await experiencePage.search(search.term_uppercase);

      await expect(async () => {
        expect(await experiencePage.visibleCardTitles()).toEqual([search.expected_title]);
      }).toPass();
    });

    test('Search matches on a partial title', { tag: ['@regression'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();
      await experiencePage.search(search.term_partial);

      await expect(async () => {
        expect(await experiencePage.visibleCardTitles()).toEqual([search.expected_title]);
      }).toPass();
    });

    test('Matched card keeps its actions', { tag: ['@regression'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();
      await experiencePage.search(search.term);

      await expect(experiencePage.cards).toHaveCount(1);
      for (const action of experiencesData.card_actions) {
        await expect(experiencePage.cards.getByRole('button', { name: action })).toBeVisible();
      }
    });

    test('A search with no matches shows the empty state', { tag: ['@regression'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();
      await experiencePage.search(search.no_match_term);

      await expect(experiencePage.emptyStateHeading).toBeVisible();
      await expect(experiencePage.emptyStateHeading).toHaveText(search.empty_state_heading);
      await expect(experiencePage.emptyStateHint).toHaveText(search.empty_state_hint);
      await expect(experiencePage.cards).toHaveCount(0);
    });

    test('Clearing the search restores a full page of cards', { tag: ['@regression'] }, async ({ page }) => {
      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();

      await expect(experiencePage.cards).toHaveCount(experiencesData.page_size);

      await experiencePage.search(search.term);
      await expect(experiencePage.cards).toHaveCount(1);

      await experiencePage.clearSearch();
      await expect(experiencePage.cards).toHaveCount(experiencesData.page_size);
    });
  });
});
