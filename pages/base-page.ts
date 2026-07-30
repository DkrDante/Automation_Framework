import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForLoad() {
    await this.page.waitForLoadState('load');
  }

  async title() {
    return this.page.title();
  }
}
