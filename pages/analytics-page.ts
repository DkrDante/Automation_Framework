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

  // Experience Performance filter mode
  readonly dashboardModeRadio: Locator;
  readonly experiencePerformanceRadio: Locator;
  readonly selectExperienceField: Locator;
  readonly experienceSearchInput: Locator;
  readonly applyFiltersBtn: Locator;
  readonly resetFiltersBtn: Locator;
  readonly experiencePerformanceHeading: Locator;
  readonly selectAnExperienceTitle: Locator;
  readonly selectAnExperienceMessage: Locator;

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

    this.dashboardModeRadio = page.getByRole('radio', { name: 'Dashboard', exact: true });
    this.experiencePerformanceRadio = page.getByRole('radio', { name: 'Experience Performance', exact: true });
    this.selectExperienceField = page.getByText('Select Experience', { exact: true });
    this.experienceSearchInput = page.getByPlaceholder('analytics.searchExperience');
    this.applyFiltersBtn = page.getByRole('button', { name: 'Apply Filters' });
    this.resetFiltersBtn = page.getByRole('button', { name: 'Reset Filters' });
    this.experiencePerformanceHeading = page.getByRole('heading', { name: 'Experience Performance', exact: true });
    this.selectAnExperienceTitle = page.getByText('Select an Experience', { exact: true });
    this.selectAnExperienceMessage = page.getByText(
      'Please select an experience from the filters to view detailed performance metrics.',
      { exact: true }
    );
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await this.page.goto(`${origin}/new-analytics`, { waitUntil: 'domcontentloaded' });
  }

  async selectExperienceForDrilldown(experienceName: string, searchTerm: string) {
    await this.showFiltersBtn.click();
    await this.experiencePerformanceRadio.click();
    await this.selectExperienceField.click();
    await this.experienceSearchInput.pressSequentially(searchTerm);
    await this.page.getByText(experienceName, { exact: true }).click();
    await this.applyFiltersBtn.click();
  }

  experienceStatCard(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }
}
