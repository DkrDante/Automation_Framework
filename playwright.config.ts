import 'dotenv/config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['line'],
    ['allure-playwright', { resultsDir: './allure-results' }],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    // Set HEADED=true to run with a visible browser window; defaults to headless.
    headless: process.env.HEADED !== 'true',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
