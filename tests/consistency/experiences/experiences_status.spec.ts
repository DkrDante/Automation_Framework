import { test, expect } from '../../../helpers/cross-fixtures';
import { ExperiencePage } from '../../../pages/experiences-page';
import {
  PAGE_SIZE,
  archived,
  byNewestFirst,
  firstPageTitles,
  unarchived,
} from '../../../helpers/experiences-data';

test.describe('Experiences status filter vs API', { tag: ['@consistency', '@regression'] }, () => {
  test('default_status_shows_unarchived_scenes_from_api', async ({ page, dashboardApi }) => {
    const scenesResponse = await dashboardApi.getScenes();
    const expected = firstPageTitles(byNewestFirst(unarchived(scenesResponse.scenes)));

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();

    await expect(async () => {
      expect(await experiencePage.visibleCardTitles()).toEqual(expected);
    }).toPass();
  });

  test('status_filter_archived_matches_api', async ({ page, dashboardApi }) => {
    const scenesResponse = await dashboardApi.getScenes();
    const expected = firstPageTitles(byNewestFirst(archived(scenesResponse.scenes)));

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await experiencePage.filterByStatus('Archived');

    await expect(async () => {
      expect(await experiencePage.visibleCardTitles()).toEqual(expected);
    }).toPass();
  });

  test('page_size_caps_each_status_bucket', async ({ page, dashboardApi }) => {
    const scenesResponse = await dashboardApi.getScenes();
    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();

    for (const [label, bucket] of [
      ['Unarchived', unarchived(scenesResponse.scenes)],
      ['Archived', archived(scenesResponse.scenes)],
    ] as const) {
      await experiencePage.filterByStatus(label);
      await expect(async () => {
        expect(await experiencePage.visibleCardTitles()).toHaveLength(
          Math.min(PAGE_SIZE, bucket.length)
        );
      }).toPass();
    }
  });

  test('switching_back_to_unarchived_restores_the_default_list', async ({ page, dashboardApi }) => {
    const scenesResponse = await dashboardApi.getScenes();
    const expected = firstPageTitles(byNewestFirst(unarchived(scenesResponse.scenes)));

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await experiencePage.filterByStatus('Archived');
    await experiencePage.filterByStatus('Unarchived');

    await expect(async () => {
      expect(await experiencePage.visibleCardTitles()).toEqual(expected);
    }).toPass();
  });
});
