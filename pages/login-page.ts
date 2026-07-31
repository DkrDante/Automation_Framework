import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly sendVerificationCodeButton: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Welcome to SatoriXR' });
    this.emailInput = page.getByPlaceholder('Enter your email to continue');
    this.sendVerificationCodeButton = page.getByRole('button', { name: 'Send Verification Code' });
    this.signUpLink = page.getByRole('link', { name: 'Sign Up' });
  }

  async open() {
    await super.goto(process.env.BASE_URL ?? 'https://try.satorixr.com');
  }
}
