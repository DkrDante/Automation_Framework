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
    baseURL: process.env.DEV_BASE_URL,
    // Set HEADED=true to run with a visible browser window; defaults to headless.
    headless: process.env.HEADED !== 'true',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      // Logs in via email OTP once and writes .auth/state.json. Runs before every
      // other test regardless of which subset/path/grep filter the run uses —
      // Playwright always executes a project's dependencies first.
      name: 'login',
      testMatch: /login\.setup\.ts/,
    },
    {
      // Deletes .auth/state.json. Wired up as `tests`' teardown below, so it runs
      // once after all tests finish (pass or fail), not as a test file on its own.
      name: 'cleanup',
      testMatch: /login\.teardown\.ts/,
    },
    {
      name: 'tests',
      testMatch: /.*\.spec\.ts/,
      dependencies: ['login'],
      teardown: 'cleanup',
    },
  ],
});
