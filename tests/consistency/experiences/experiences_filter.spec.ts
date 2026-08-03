import { test, expect } from '../../../helpers/cross-fixtures';
import { ExperiencePage } from '../../../pages/experiences-page';
import {
  byNewestFirst,
  firstPageTitles,
  scenesInCategory,
  unarchived,
} from '../../../helpers/experiences-data';

test.describe('Experiences category filter vs API', { tag: ['@consistency', '@regression'] }, () => {
  test('all_categories_shows_unarchived_scenes_newest_first', async ({ page, dashboardApi }) => {
    const scenesResponse = await dashboardApi.getScenes();
    const expected = firstPageTitles(byNewestFirst(unarchived(scenesResponse.scenes)));

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();

    await expect(async () => {
      expect(await experiencePage.visibleCardTitles()).toEqual(expected);
    }).toPass();
  });

  test('parent_category_filter_matches_linked_products_in_api', async ({ page, dashboardApi }) => {
    const [scenesResponse, products] = await Promise.all([
      dashboardApi.getScenes(),
      dashboardApi.getProducts(),
    ]);
    const expected = firstPageTitles(
      byNewestFirst(scenesInCategory(unarchived(scenesResponse.scenes), products, 'automotive'))
    );

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await experiencePage.filterByCategory('Automotive');

    await expect(async () => {
      expect(await experiencePage.visibleCardTitles()).toEqual(expected);
    }).toPass();
  });

  test('subcategory_filter_matches_linked_products_in_api', async ({ page, dashboardApi }) => {
    const [scenesResponse, products] = await Promise.all([
      dashboardApi.getScenes(),
      dashboardApi.getProducts(),
    ]);
    const expected = firstPageTitles(
      byNewestFirst(
        scenesInCategory(unarchived(scenesResponse.scenes), products, 'truck', 'subCategory')
      )
    );

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await experiencePage.filterByCategorySlug('truck');

    await expect(async () => {
      expect(await experiencePage.visibleCardTitles()).toEqual(expected);
    }).toPass();
  });

  test('clearing_category_filter_restores_full_list', async ({ page, dashboardApi }) => {
    const scenesResponse = await dashboardApi.getScenes();
    const expected = firstPageTitles(byNewestFirst(unarchived(scenesResponse.scenes)));

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await experiencePage.filterByCategory('Automotive');
    await experiencePage.filterByCategory('All Categories');

    await expect(async () => {
      expect(await experiencePage.visibleCardTitles()).toEqual(expected);
    }).toPass();
  });
});
