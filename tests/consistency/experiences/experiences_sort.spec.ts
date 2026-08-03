import { test, expect } from '../../../helpers/cross-fixtures';
import { ExperiencePage } from '../../../pages/experiences-page';
import experiencesData from '../../../fixtures/experiences.json';
import {
  SORT_ORDERINGS,
  archived,
  firstPageTitles,
  scenesInCategory,
  unarchived,
} from '../../../helpers/experiences-data';

const ENABLED_SORTS = experiencesData.sort_options.filter(
  (label) => !experiencesData.disabled_sort_options.includes(label)
);

const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '_');

test.describe('Experiences sort vs API', { tag: ['@consistency', '@regression'] }, () => {
  for (const sortLabel of ENABLED_SORTS) {
    test(`sort_${slug(sortLabel)}_matches_api`, async ({ page, dashboardApi }) => {
      const scenesResponse = await dashboardApi.getScenes();
      const expected = firstPageTitles(
        SORT_ORDERINGS[sortLabel](unarchived(scenesResponse.scenes))
      );

      const experiencePage = new ExperiencePage(page);
      await experiencePage.open();
      await experiencePage.sortBy(sortLabel);

      await expect(async () => {
        expect(await experiencePage.visibleCardTitles()).toEqual(expected);
      }).toPass();
    });
  }

  test('sort_composes_with_category_filter', async ({ page, dashboardApi }) => {
    const [scenesResponse, products] = await Promise.all([
      dashboardApi.getScenes(),
      dashboardApi.getProducts(),
    ]);
    const expected = firstPageTitles(
      SORT_ORDERINGS['Name A-Z'](
        scenesInCategory(unarchived(scenesResponse.scenes), products, 'automotive')
      )
    );

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await experiencePage.filterByCategory('Automotive');
    await experiencePage.sortBy('Name A-Z');

    await expect(async () => {
      expect(await experiencePage.visibleCardTitles()).toEqual(expected);
    }).toPass();
  });

  test('sort_survives_a_status_change', async ({ page, dashboardApi }) => {
    const scenesResponse = await dashboardApi.getScenes();
    const expected = firstPageTitles(
      SORT_ORDERINGS['Name Z-A'](archived(scenesResponse.scenes))
    );

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await experiencePage.sortBy('Name Z-A');
    await experiencePage.filterByStatus('Archived');

    await expect(async () => {
      expect(await experiencePage.visibleCardTitles()).toEqual(expected);
    }).toPass();
  });
});
