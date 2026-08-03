import { test as setup } from '@playwright/test';
import path from 'node:path';
import { LoginPage } from '../../../pages/login-page';

const STORAGE_STATE_PATH =
  process.env.AUTH_STORAGE_STATE ?? path.resolve(__dirname, '../../../.auth/state.json');

setup('authenticate via email OTP and save session', async ({ page }) => {
  const email = process.env.EMAIL;
  const otp = process.env.OTP;
  if (!email) throw new Error('EMAIL must be set in .env to run the login setup.');
  if (!otp) throw new Error('OTP must be set in .env to run the login setup.');

  const loginPage = new LoginPage(page);
  await loginPage.open();

  await loginPage.emailInput.fill(email);
  await loginPage.sendVerificationCodeButton.click();

  await loginPage.otpInput.waitFor({ state: 'visible' });
  await loginPage.otpInput.fill(otp);
  await loginPage.verifyAndSignInButton.click();

  // The OTP form lives at /login; wait for the app to navigate away from it as
  // proof sign-in actually succeeded, rather than just that the click landed.
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30000 });

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
