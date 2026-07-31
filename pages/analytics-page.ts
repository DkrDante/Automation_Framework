import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class AnalyticsPage extends BasePage {
  readonly dashboardHeading: Locator;
  readonly exportDataBtn: Locator;
  readonly showFiltersBtn: Locator;
  readonly autoRefreshBtn: Locator;
  readonly sessionMetricsHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardHeading = page.getByText('Dashboard', { exact: true });
    this.exportDataBtn = page.getByRole('button', { name: 'Export Data' });
    this.showFiltersBtn = page.getByRole('button', { name: 'Show Filters' });
    this.autoRefreshBtn = page.getByText(/Auto-refresh/, { exact: false });
    this.sessionMetricsHeader = page.getByText('Session Metrics', { exact: true });
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await super.goto(`${origin}/new-analytics`);
  }
}
