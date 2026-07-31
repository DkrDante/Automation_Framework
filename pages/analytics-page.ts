import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class AnalyticsPage extends BasePage {
  readonly dashboardHeading: Locator;
  readonly autoRefreshBtn: Locator;
  readonly exportDataBtn: Locator;
  readonly showFiltersBtn: Locator;

  // Stat cards
  readonly totalProductsCard: Locator;
  readonly totalExperiencesCard: Locator;
  readonly totalUsersCard: Locator;
  readonly totalSessionsCard: Locator;

  // Session metrics section
  readonly sessionMetricsHeader: Locator;
  readonly allProductsDropdown: Locator;
  readonly allExperiencesDropdown: Locator;

  // Charts
  readonly sessionTrendHeading: Locator;
  readonly deviceDistributionHeading: Locator;
  readonly top5ExperiencesHeading: Locator;
  readonly top5UsersHeading: Locator;

  // Activity Log
  readonly userActivityLogHeading: Locator;
  readonly allActivitiesBtn: Locator;
  readonly searchActivitiesInput: Locator;
  readonly exportCsvBtn: Locator;

  // Activity Table Headers
  readonly sessionIdCol: Locator;
  readonly eventTypeCol: Locator;
  readonly timestampCol: Locator;
  readonly userIdCol: Locator;
  readonly deviceInfoCol: Locator;
  readonly hotspotTitleCol: Locator;
  readonly experienceCol: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
    this.autoRefreshBtn = page.getByText(/Auto-refresh/, { exact: false });
    this.exportDataBtn = page.getByRole('button', { name: 'Export Data' });
    this.showFiltersBtn = page.getByRole('button', { name: 'Show Filters' });

    this.totalProductsCard = page.getByText('Total Products', { exact: true });
    this.totalExperiencesCard = page.getByText('Total Experiences', { exact: true });
    this.totalUsersCard = page.getByText('Total Users', { exact: true });
    this.totalSessionsCard = page.getByText('Total Sessions', { exact: true });

    this.sessionMetricsHeader = page.getByRole('heading', { name: 'Session Metrics' });
    this.allProductsDropdown = page.getByText('All products', { exact: true });
    this.allExperiencesDropdown = page.getByText('All experiences', { exact: true });

    this.sessionTrendHeading = page.getByRole('heading', { name: 'Session Trend by Device' });
    this.deviceDistributionHeading = page.getByRole('heading', { name: 'Device Distribution' });
    this.top5ExperiencesHeading = page.getByRole('heading', { name: 'Top 5 Experiences' });
    this.top5UsersHeading = page.getByRole('heading', { name: 'Top 5 Users' });

    this.userActivityLogHeading = page.getByRole('heading', { name: /User Activity Log/ });
    this.allActivitiesBtn = page.getByRole('button', { name: 'All Activities' });
    this.searchActivitiesInput = page.getByPlaceholder('Search activities...');
    this.exportCsvBtn = page.getByRole('button', { name: 'Export CSV' });

    this.sessionIdCol = page.getByRole('columnheader', { name: 'Session ID' });
    this.eventTypeCol = page.getByRole('columnheader', { name: 'Event Type' });
    this.timestampCol = page.getByRole('columnheader', { name: 'Timestamp' });
    this.userIdCol = page.getByRole('columnheader', { name: 'User ID' });
    this.deviceInfoCol = page.getByRole('columnheader', { name: 'Device Info' });
    this.hotspotTitleCol = page.getByRole('columnheader', { name: 'Hotspot Title' });
    this.experienceCol = page.getByRole('columnheader', { name: 'Experience' });
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await this.page.goto(`${origin}/new-analytics`, { waitUntil: 'domcontentloaded' });
  }
}
