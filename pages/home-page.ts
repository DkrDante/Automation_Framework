import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  readonly overviewHeading: Locator;
  readonly settingsNavItem: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.overviewHeading = page.getByRole('heading', { name: 'Overview' });
    this.settingsNavItem = page.getByText('Settings', { exact: true });
    this.errorBanner = page.getByText(/something went wrong|error occurred|404/i);
  }

  async open() {
    const origin = new URL(process.env.DEV_BASE_URL ?? 'https://dev.devsatorixr.com').origin;
    await super.goto(`${origin}/home`);
    // Overview stats load asynchronously after the shell renders — wait once here
    // so every subsequent assertion isn't racing the same slow dashboard API.
    await this.overviewCard('Total Products').waitFor({ state: 'visible', timeout: 30000 });
  }

  navItem(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }

  overviewCardLabel(label: string): Locator {
    return this.page.getByText(label, { exact: true });
  }

  // Card container = 2 levels up from the label; also holds the metric's number.
  overviewCard(label: string): Locator {
    return this.overviewCardLabel(label).locator('xpath=../..');
  }

  subNavItem(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }

  async openSettingsSubNav() {
    await this.settingsNavItem.click();
  }
}
