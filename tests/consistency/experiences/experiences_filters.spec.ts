import { test, expect } from '../../../helpers/cross-fixtures';
import { ExperiencePage } from '../../../pages/experiences-page';

function byDateDesc(scenes: any[]) {
  return [...scenes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const PAGE_SIZE = 12;

test.describe('Experiences Filters vs API', { tag: ['@consistency', '@regression'] }, () => {
  test('category_filter_matches_linked_products_in_api', async ({ page, dashboardApi }) => {
    const [scenesResponse, products] = await Promise.all([
      dashboardApi.getScenes(),
      dashboardApi.getProducts(),
    ]);

    const automotiveProductIds = new Set(
      products.filter((p: any) => p.category === 'automotive').map((p: any) => p.id)
    );
    const expected = byDateDesc(
      scenesResponse.scenes.filter(
        (s: any) =>
          s.status !== 'archived' &&
          (s.productIds ?? [s.productId]).some((id: string) => automotiveProductIds.has(id))
      )
    )
      .slice(0, PAGE_SIZE)
      .map((s: any) => s.name);

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await experiencePage.filterByCategory('Automotive');

    await expect(async () => {
      expect(await experiencePage.visibleCardTitles()).toEqual(expected);
    }).toPass();
  });

  test('status_filter_archived_matches_api', async ({ page, dashboardApi }) => {
    const scenesResponse = await dashboardApi.getScenes();
    const expected = byDateDesc(scenesResponse.scenes.filter((s: any) => s.status === 'archived'))
      .slice(0, PAGE_SIZE)
      .map((s: any) => s.name);

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await experiencePage.filterByStatus('Archived');

    await expect(async () => {
      expect(await experiencePage.visibleCardTitles()).toEqual(expected);
    }).toPass();
  });

  test('sort_name_a_to_z_matches_api', async ({ page, dashboardApi }) => {
    const scenesResponse = await dashboardApi.getScenes();
    const expected = scenesResponse.scenes
      .filter((s: any) => s.status !== 'archived')
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
      .slice(0, PAGE_SIZE)
      .map((s: any) => s.name);

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await experiencePage.sortBy('Name A-Z');

    await expect(async () => {
      expect(await experiencePage.visibleCardTitles()).toEqual(expected);
    }).toPass();
  });
});
