import { test, expect } from '../../../helpers/auth-fixtures';
import { PRODUCTS_TARGET as target } from '../../../helpers/catalog-targets';
import { uiScenarioGroups } from '../../../helpers/catalog-scenarios';
import { ProductsPage } from '../../../pages/products-page';
import productsData from '../../../fixtures/products.json';

test.describe(target.name, { tag: ['@ui'] }, () => {
  for (const [group, scenarios] of uiScenarioGroups(target)) {
    test.describe(group, () => {
      for (const { name, tag, fn } of scenarios) test(name, { tag: [tag] }, fn);
    });
  }

  // Products-only: unlike experience cards, product cards report how many
  // experiences link them.
  test.describe('Experience counts', () => {
    test('Every card shows an experience count', { tag: ['@regression'] }, async ({ page }) => {
      const productsPage = new ProductsPage(page);
      await productsPage.open();

      await expect(productsPage.cards).toHaveCount(productsData.page_size);
      await expect(productsPage.cardGrid.getByText(/^Experiences:\s*\d+$/)).toHaveCount(
        productsData.page_size
      );
    });

    test('The searched card shows its experience count', { tag: ['@regression'] }, async ({ page }) => {
      const productsPage = new ProductsPage(page);
      await productsPage.open();
      await productsPage.search(productsData.search.term);

      await expect(productsPage.cards).toHaveCount(1);
      await expect(productsPage.experienceCount(productsData.search.expected_title)).toBeVisible();
    });
  });
});
