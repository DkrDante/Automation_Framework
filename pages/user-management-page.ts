import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class UserManagementPage extends BasePage {
  readonly heading: Locator;
  readonly addUserBtn: Locator;
  readonly refreshBtn: Locator;
  readonly usersHeader: Locator;
  readonly emailColumnHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'User Management' });
    this.addUserBtn = page.getByRole('button', { name: 'Add User' });
    this.refreshBtn = page.getByRole('button', { name: 'Refresh' });
    this.usersHeader = page.getByText(/Users \(\d+\)/);
    this.emailColumnHeader = page.getByText('Email', { exact: true });
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await super.goto(`${origin}/users`);
  }
}
