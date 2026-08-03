import { Page, expect } from '@playwright/test';
import { DashboardAPIService } from '../services/api_service';
import { CatalogTarget } from './catalog-targets';
import {
  CatalogItem,
  SORT_ORDERINGS,
  archived,
  byNewestFirst,
  firstPageTitles,
  unarchived,
} from './catalog-data';

/**
 * Reusable test bodies for the catalog pages (Experiences, Products), which
 * share one page shell. Each scenario is a ready-to-use Playwright test
 * function closed over its target, so the spec files stay declarative:
 *
 *   for (const { name, fn } of filterScenarios(target)) test(name, fn);
 *
 * The `test()` calls deliberately live in the spec files rather than here —
 * Playwright and Allure derive a test's suite from where it was declared, so
 * declaring them in a helper would file every result under this module.
 */

/** Consistency scenarios are all tagged at the describe level by their spec. */
export interface CatalogScenario {
  name: string;
  fn: (args: { page: Page; dashboardApi: DashboardAPIService }) => Promise<void>;
}

export interface CatalogUiScenario {
  group: string;
  name: string;
  tag: string;
  fn: (args: { page: Page }) => Promise<void>;
}

const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '_');

/**
 * Every catalog assertion has the same shape: derive the expected page of card
 * titles from the API, then poll the grid until it matches. The grid re-renders
 * asynchronously after each control change, hence the toPass() wrapper.
 */
const expectGrid = async (titles: () => Promise<string[]>, expected: string[]) => {
  await expect(async () => {
    expect(await titles()).toEqual(expected);
  }).toPass();
};

export function filterScenarios(target: CatalogTarget): CatalogScenario[] {
  const { data } = target;
  const defaultPage = (items: CatalogItem[]) =>
    firstPageTitles(byNewestFirst(unarchived(items)), data.page_size);

  return [
    {
      name: 'all_categories_shows_unarchived_items_newest_first',
      fn: async ({ page, dashboardApi }) => {
        const expected = defaultPage(await target.allItems(dashboardApi));

        const catalogPage = target.newPage(page);
        await catalogPage.open();

        await expectGrid(() => catalogPage.visibleCardTitles(), expected);
      },
    },
    {
      name: 'parent_category_filter_matches_api',
      fn: async ({ page, dashboardApi }) => {
        const expected = defaultPage(
          await target.itemsInCategory(dashboardApi, data.category.slug, 'category')
        );

        const catalogPage = target.newPage(page);
        await catalogPage.open();
        await catalogPage.filterByCategory(data.category.label);

        await expectGrid(() => catalogPage.visibleCardTitles(), expected);
      },
    },
    {
      name: 'subcategory_filter_matches_api',
      fn: async ({ page, dashboardApi }) => {
        const expected = defaultPage(
          await target.itemsInCategory(dashboardApi, data.category.sub_slug, 'subCategory')
        );

        const catalogPage = target.newPage(page);
        await catalogPage.open();
        await catalogPage.filterByCategorySlug(data.category.sub_slug);

        await expectGrid(() => catalogPage.visibleCardTitles(), expected);
      },
    },
    {
      name: 'clearing_category_filter_restores_full_list',
      fn: async ({ page, dashboardApi }) => {
        const expected = defaultPage(await target.allItems(dashboardApi));

        const catalogPage = target.newPage(page);
        await catalogPage.open();
        await catalogPage.filterByCategory(data.category.label);
        await catalogPage.filterByCategory('All Categories');

        await expectGrid(() => catalogPage.visibleCardTitles(), expected);
      },
    },
  ];
}

export function sortScenarios(target: CatalogTarget): CatalogScenario[] {
  const { data } = target;
  const enabledSorts = data.sort_options.filter(
    (label) => !data.disabled_sort_options.includes(label)
  );

  return [
    ...enabledSorts.map((sortLabel) => ({
      name: `sort_${slug(sortLabel)}_matches_api`,
      fn: async ({ page, dashboardApi }: { page: Page; dashboardApi: DashboardAPIService }) => {
        const items = unarchived(await target.allItems(dashboardApi));
        const expected = firstPageTitles(SORT_ORDERINGS[sortLabel](items), data.page_size);

        const catalogPage = target.newPage(page);
        await catalogPage.open();
        await catalogPage.sortBy(sortLabel);

        await expectGrid(() => catalogPage.visibleCardTitles(), expected);
      },
    })),
    {
      name: 'sort_composes_with_category_filter',
      fn: async ({ page, dashboardApi }) => {
        const items = unarchived(
          await target.itemsInCategory(dashboardApi, data.category.slug, 'category')
        );
        const expected = firstPageTitles(SORT_ORDERINGS['Name A-Z'](items), data.page_size);

        const catalogPage = target.newPage(page);
        await catalogPage.open();
        await catalogPage.filterByCategory(data.category.label);
        await catalogPage.sortBy('Name A-Z');

        await expectGrid(() => catalogPage.visibleCardTitles(), expected);
      },
    },
    {
      name: 'sort_survives_a_status_change',
      fn: async ({ page, dashboardApi }) => {
        const items = archived(await target.allItems(dashboardApi));
        const expected = firstPageTitles(SORT_ORDERINGS['Name Z-A'](items), data.page_size);

        const catalogPage = target.newPage(page);
        await catalogPage.open();
        await catalogPage.sortBy('Name Z-A');
        await catalogPage.filterByStatus('Archived');

        await expectGrid(() => catalogPage.visibleCardTitles(), expected);
      },
    },
  ];
}

export function statusScenarios(target: CatalogTarget): CatalogScenario[] {
  const { data } = target;
  const page1 = (items: CatalogItem[]) => firstPageTitles(byNewestFirst(items), data.page_size);

  return [
    {
      name: 'default_status_shows_unarchived_items_from_api',
      fn: async ({ page, dashboardApi }) => {
        const expected = page1(unarchived(await target.allItems(dashboardApi)));

        const catalogPage = target.newPage(page);
        await catalogPage.open();

        await expectGrid(() => catalogPage.visibleCardTitles(), expected);
      },
    },
    {
      name: 'status_filter_archived_matches_api',
      fn: async ({ page, dashboardApi }) => {
        const expected = page1(archived(await target.allItems(dashboardApi)));

        const catalogPage = target.newPage(page);
        await catalogPage.open();
        await catalogPage.filterByStatus('Archived');

        await expectGrid(() => catalogPage.visibleCardTitles(), expected);
      },
    },
    {
      name: 'page_size_caps_each_status_bucket',
      fn: async ({ page, dashboardApi }) => {
        const items = await target.allItems(dashboardApi);
        const catalogPage = target.newPage(page);
        await catalogPage.open();

        for (const [label, bucket] of [
          ['Unarchived', unarchived(items)],
          ['Archived', archived(items)],
        ] as const) {
          await catalogPage.filterByStatus(label);
          await expect(async () => {
            expect(await catalogPage.visibleCardTitles()).toHaveLength(
              Math.min(data.page_size, bucket.length)
            );
          }).toPass();
        }
      },
    },
    {
      name: 'switching_back_to_unarchived_restores_the_default_list',
      fn: async ({ page, dashboardApi }) => {
        const expected = page1(unarchived(await target.allItems(dashboardApi)));

        const catalogPage = target.newPage(page);
        await catalogPage.open();
        await catalogPage.filterByStatus('Archived');
        await catalogPage.filterByStatus('Unarchived');

        await expectGrid(() => catalogPage.visibleCardTitles(), expected);
      },
    },
  ];
}

/**
 * UI-only coverage — shell, toolbar and search. Nothing here touches the API,
 * so every expectation comes from the target's fixture.
 */
export function uiScenarios(target: CatalogTarget): CatalogUiScenario[] {
  const { data } = target;
  const search = data.search;

  const searchNarrowsTo = (term: string) => async ({ page }: { page: Page }) => {
    const catalogPage = target.newPage(page);
    await catalogPage.open();
    await catalogPage.search(term);

    await expectGrid(() => catalogPage.visibleCardTitles(), [search.expected_title]);
  };

  return [
    {
      group: 'Page basics',
      name: 'Title contains SatoriXR',
      tag: '@smoke',
      fn: async ({ page }) => {
        await target.newPage(page).open();

        await expect(page).toHaveTitle(/SatoriXR/);
      },
    },
    {
      group: 'Page basics',
      name: `URL resolves to the ${data.route} route`,
      tag: '@smoke',
      fn: async ({ page }) => {
        await target.newPage(page).open();

        await expect(page).toHaveURL(new RegExp(data.url_pattern));
      },
    },
    {
      group: 'Page basics',
      name: 'Heading is visible',
      tag: '@smoke',
      fn: async ({ page }) => {
        const catalogPage = target.newPage(page);
        await catalogPage.open();

        await expect(catalogPage.heading).toBeVisible();
      },
    },
    {
      group: 'Page basics',
      name: 'Heading text is exact',
      tag: '@regression',
      fn: async ({ page }) => {
        const catalogPage = target.newPage(page);
        await catalogPage.open();

        await expect(catalogPage.heading).toHaveText(data.page_heading);
      },
    },
    {
      group: 'Page basics',
      name: 'Subheading is visible',
      tag: '@smoke',
      fn: async ({ page }) => {
        const catalogPage = target.newPage(page);
        await catalogPage.open();

        await expect(catalogPage.subheading).toBeVisible();
      },
    },
    {
      group: 'Page basics',
      name: 'Subheading text is exact',
      tag: '@regression',
      fn: async ({ page }) => {
        const catalogPage = target.newPage(page);
        await catalogPage.open();

        await expect(catalogPage.subheading).toHaveText(data.page_subheading);
      },
    },
    {
      group: 'Page basics',
      name: `${data.create_link} button is visible`,
      tag: '@smoke',
      fn: async ({ page }) => {
        const catalogPage = target.newPage(page);
        await catalogPage.open();

        await expect(catalogPage.createLink).toBeVisible();
        await expect(catalogPage.createLink).toHaveAttribute('href', data.create_link_href);
      },
    },
    {
      group: 'Toolbar controls',
      name: 'Search input shows its placeholder',
      tag: '@smoke',
      fn: async ({ page }) => {
        const catalogPage = target.newPage(page);
        await catalogPage.open();

        await expect(catalogPage.searchInput).toBeVisible();
        await expect(catalogPage.searchInput).toHaveAttribute(
          'placeholder',
          data.search_placeholder
        );
      },
    },
    {
      group: 'Toolbar controls',
      name: 'Sort dropdown offers every option',
      tag: '@regression',
      fn: async ({ page }) => {
        const catalogPage = target.newPage(page);
        await catalogPage.open();

        expect(await catalogPage.sortOptionLabels()).toEqual(data.sort_options);
      },
    },
    {
      group: 'Toolbar controls',
      name: 'Status dropdown offers every option',
      tag: '@regression',
      fn: async ({ page }) => {
        const catalogPage = target.newPage(page);
        await catalogPage.open();

        expect(await catalogPage.statusOptionLabels()).toEqual(data.status_options);
      },
    },
    {
      group: 'Search',
      name: `Searching "${search.term}" narrows the grid to ${search.expected_title}`,
      tag: '@smoke',
      fn: searchNarrowsTo(search.term),
    },
    {
      group: 'Search',
      name: 'Search is case-insensitive',
      tag: '@regression',
      fn: searchNarrowsTo(search.term_uppercase),
    },
    {
      group: 'Search',
      name: 'Search matches on a partial title',
      tag: '@regression',
      fn: searchNarrowsTo(search.term_partial),
    },
    {
      group: 'Search',
      name: 'Matched card keeps its actions',
      tag: '@regression',
      fn: async ({ page }) => {
        const catalogPage = target.newPage(page);
        await catalogPage.open();
        await catalogPage.search(search.term);

        await expect(catalogPage.cards).toHaveCount(1);
        for (const action of data.card_actions) {
          await expect(catalogPage.cards.getByRole('button', { name: action })).toBeVisible();
        }
      },
    },
    {
      group: 'Search',
      name: 'A search with no matches shows the empty state',
      tag: '@regression',
      fn: async ({ page }) => {
        const catalogPage = target.newPage(page);
        await catalogPage.open();
        await catalogPage.search(search.no_match_term);

        await expect(catalogPage.emptyStateHeading).toBeVisible();
        await expect(catalogPage.emptyStateHeading).toHaveText(data.empty_state_heading);
        await expect(catalogPage.emptyStateHint).toHaveText(data.empty_state_hint);
        await expect(catalogPage.cards).toHaveCount(0);
      },
    },
    {
      group: 'Search',
      name: 'Clearing the search restores a full page of cards',
      tag: '@regression',
      fn: async ({ page }) => {
        const catalogPage = target.newPage(page);
        await catalogPage.open();

        await expect(catalogPage.cards).toHaveCount(data.page_size);

        await catalogPage.search(search.term);
        await expect(catalogPage.cards).toHaveCount(1);

        await catalogPage.clearSearch();
        await expect(catalogPage.cards).toHaveCount(data.page_size);
      },
    },
  ];
}

/** Groups UI scenarios in declaration order, for nested test.describe blocks. */
export function uiScenarioGroups(target: CatalogTarget): [string, CatalogUiScenario[]][] {
  const groups = new Map<string, CatalogUiScenario[]>();
  for (const scenario of uiScenarios(target)) {
    const existing = groups.get(scenario.group) ?? [];
    existing.push(scenario);
    groups.set(scenario.group, existing);
  }
  return [...groups];
}
