import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/login-page';

test.describe('Login', { tag: ['@ui', '@regression'] }, () => {
  test('Welcome heading', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.heading).toHaveText('Welcome to SatoriXR');
  });

  test('Email textbox', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.emailInput).toHaveAttribute('placeholder', 'Enter your email to continue');
  });

  test('Send verification code button', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    await expect(loginPage.sendVerificationCodeButton).toBeVisible();
  });

  test('Page title contains SatoriXR', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    await expect(page).toHaveTitle(/SatoriXR/);
  });

  test('URL contains login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    await expect(page).toHaveURL(/\/login/);
  });
});
