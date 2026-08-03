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
    // Navigate straight to /login rather than to BASE_URL's root and trusting the app
    // to redirect here. The SPA paints its dashboard shell first and only settles on
    // /login once the auth check resolves, so assertions could run against that
    // intermediate shell — where every locator below is absent and the URL isn't
    // /login yet. Observed failing whenever the machine was under load.
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com').origin;
    await super.goto(`${origin}/login`);
    await this.emailInput.waitFor({ state: 'visible' });
  }
}
