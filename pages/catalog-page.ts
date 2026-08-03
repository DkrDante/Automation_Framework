import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export interface CatalogFixture {
  route: string;
  url_pattern: string;
  page_heading: string;
  page_subheading: string;
  create_link: string;
  create_link_href: string;
  search_placeholder: string;
  filter_order: string[];
  page_size: number;
  default_sort: string;
  default_status: string;
  sort_options: string[];
  disabled_sort_options: string[];
  status_options: string[];
  card_actions: string[];
  empty_state_heading: string;
  empty_state_hint: string;
  search: {
    term: string;
    term_uppercase: string;
    term_partial: string;
    expected_title: string;
    no_match_term: string;
  };
  category: {
    label: string;
    slug: string;
    sub_slug: string;
  };
}

export class CatalogPage extends BasePage {
  readonly heading: Locator;
  readonly subheading: Locator;
  readonly createLink: Locator;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly sortFilter: Locator;
  readonly statusFilter: Locator;
  readonly clearFiltersButton: Locator;
  readonly cardGrid: Locator;
  readonly cards: Locator;
  readonly cardTitles: Locator;
  readonly emptyStateHeading: Locator;
  readonly emptyStateHint: Locator;

  constructor(page: Page, readonly fixture: CatalogFixture) {
    super(page);
    const selectFor = (kind: string) =>
      page.locator('select').nth(fixture.filter_order.indexOf(kind));

    this.heading = page.getByRole('heading', { name: fixture.page_heading });
    this.subheading = this.heading.locator('xpath=following-sibling::p[1]');
    this.createLink = page.getByRole('link', { name: fixture.create_link });
    this.searchInput = page.getByPlaceholder(fixture.search_placeholder);
    this.categoryFilter = selectFor('category');
    this.sortFilter = selectFor('sort');
    this.statusFilter = selectFor('status');
    this.clearFiltersButton = page.getByRole('button', { name: 'Clear filters' });
    this.cardGrid = page.locator('div.grid');
    this.cards = this.cardGrid.locator(':scope > div');
    this.cardTitles = this.cardGrid.locator('h3');
    this.emptyStateHeading = page.getByRole('heading', { name: fixture.empty_state_heading });
    this.emptyStateHint = page.getByText(fixture.empty_state_hint);
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com').origin;
    await super.goto(`${origin}${this.fixture.route}`);

    await this.heading.waitFor({ state: 'visible' });
    await this.cardTitles.first().waitFor({ state: 'visible', timeout: 30000 });
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.searchInput.fill('');
  }

  card(name: string): Locator {
    return this.cardTitles.filter({ hasText: name }).locator('..');
  }

  async filterByCategory(label: string) {
    await this.categoryFilter.selectOption({ label });
  }


  async filterByCategorySlug(slug: string) {
    await this.categoryFilter.selectOption(slug);
  }

  async sortBy(label: string) {
    await this.sortFilter.selectOption({ label });
  }

  async filterByStatus(label: string) {
    await this.statusFilter.selectOption({ label });
  }

  async visibleCardTitles(): Promise<string[]> {
    const titles = await this.cardTitles.allTextContents();
    return titles.map((t) => t.trim());
  }

  private async optionLabels(select: Locator, onlyDisabled = false): Promise<string[]> {
    return select.locator('option').evaluateAll(
      (options, disabledOnly) =>
        (options as HTMLOptionElement[])
          .filter((o) => !disabledOnly || o.disabled)
          .map((o) => (o.textContent ?? '').trim()),
      onlyDisabled
    );
  }

  sortOptionLabels() { return this.optionLabels(this.sortFilter); }
  disabledSortOptionLabels() { return this.optionLabels(this.sortFilter, true); }
  statusOptionLabels() { return this.optionLabels(this.statusFilter); }
}
