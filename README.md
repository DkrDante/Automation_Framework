# Automation Framework

Playwright + TypeScript test automation for **SatoriXR** (`https://try.satorixr.com`), reporting through **Allure Report 3**.

## Stack

- [Playwright Test](https://playwright.dev/) — test runner (UI + API)
- TypeScript, strict mode
- [Allure Report 3](https://allurereport.org/docs/v3/) (`allure`, `allure-playwright`) — HTML reporting
- `dotenv` — loads `.env` into `playwright.config.ts`

## Project structure

```
pages/            Page Object Model classes (BasePage + page-specific classes)
helpers/          Shared test utilities (incl. auth-fixtures.ts)
fixtures/         Test data (e.g. home.json — expected page content used by tests/ui/home)
.auth/            Saved logged-in session (state.json — gitignored)
tests/
  ui/             Browser-driven tests (Playwright `page` fixture)
    Login/        Unauthenticated
    home/         Authenticated (via helpers/auth-fixtures.ts)
  api/            HTTP-level tests (Playwright `request` fixture, no browser)
playwright.config.ts
run-tests.bat     Runs the suite then generates + opens the Allure report
```

Tests are split into `tests/ui` and `tests/api` so each layer can be run, tagged, and reported on independently. Add new suites under whichever folder matches how the test drives the app (through the browser vs. directly over HTTP). Tests that combine both (e.g. asserting a UI count matches an API response) are intentionally out of scope for now — keep new suites purely UI or purely API.

## Page Object Model

Every page object extends [`pages/base-page.ts`](pages/base-page.ts), which wraps the common `Page` operations (`goto`, `waitForLoad`, `title`). Example: [`pages/login-page.ts`](pages/login-page.ts) exposes locators for the login screen and an `open()` method that navigates to `BASE_URL`.

```ts
const loginPage = new LoginPage(page);
await loginPage.open();
await expect(loginPage.heading).toBeVisible();
```

**Gotcha — `waitUntil`:** `BasePage.goto()` uses `waitUntil: 'domcontentloaded'`, not the Playwright default `'load'`. The app never reliably fires the browser `load` event (likely due to persistent polling/websocket connections), so `'load'` causes spurious 30s navigation timeouts even once the page is fully usable.

**Gotcha — async page data:** Some pages (e.g. the Home dashboard) render their shell instantly but fetch their real content asynchronously afterward — [`pages/home-page.ts`](pages/home-page.ts)'s `open()` explicitly waits for a known-slow element (the "Total Products" card) before returning, so every test built on top of it doesn't have to separately race the same slow API:

```ts
async open() {
  await super.goto(origin);
  await this.overviewCard('Total Products').waitFor({ state: 'visible', timeout: 30000 });
}
```

If you add a page object for another async-loading page, follow the same pattern — wait for one concrete, known-slow element in `open()` rather than scattering ad-hoc timeouts across every test.

## Authentication

The app gates most pages behind an email-OTP login, which can't be driven end-to-end in an automated test (there's no inbox to read the code from). Instead, [`helpers/auth-fixtures.ts`](helpers/auth-fixtures.ts) exports a `test`/`expect` pair that overrides Playwright's `storageState` option, so any spec importing from it runs with an already-authenticated browser context.

- **Login spec** (`tests/ui/Login`) imports `test`/`expect` from `@playwright/test` directly — it needs a clean, unauthenticated context.
- **Everything else** (e.g. `tests/ui/home`) imports from `../../../helpers/auth-fixtures` instead.

To generate the session it reuses:

```bash
npx playwright codegen --save-storage=.auth/state.json https://try.satorixr.com/login
```

Log in manually in the opened browser (complete the email OTP step), then close the window — Playwright saves cookies/localStorage to `.auth/state.json`. That file is gitignored and expires with the session, so regenerate it whenever authenticated tests start failing with a 401/redirect-to-login.

## Data-driven, atomic tests

`tests/ui/home/home.spec.ts` is the reference pattern for new UI suites: expected page content lives in a `fixtures/*.json` file, and the spec generates one `test()` per data item at module-load time (not a loop inside a single test), so each check gets its own row in the Playwright/Allure report and fails independently:

```ts
import homeData from '../../../fixtures/home.json';

for (const cardTitle of homeData.expected_cards) {
  test(`${cardTitle} card is visible`, { tag: ['@smoke'] }, async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await expect(homePage.overviewCard(cardTitle)).toBeVisible();
  });
}
```

Each test asserts exactly one thing. Prefer this over one big test with many assertions — a single failure then tells you precisely which card/nav item/label broke, instead of "something in this test failed."

## Tags

Tests are tagged using Playwright's built-in `tag` option on `test.describe`/`test`, so they show up in both the console output and the Allure report.

| Tag           | Meaning                                   |
|---------------|--------------------------------------------|
| `@ui`         | Browser-driven test (`tests/ui`)           |
| `@api`        | HTTP-level test (`tests/api`)              |
| `@regression` | Part of the core regression suite          |
| `@smoke`      | Fast, critical-path check                  |

Two levels of granularity are in use, pick whichever fits the suite:

- **Blanket, describe-level** (`tests/ui/Login`, `tests/api/manifest`) — every test in the file gets the same tags: `{ tag: ['@ui', '@regression'] }` on `test.describe`.
- **Per-test** (`tests/ui/home`) — `@ui` is set once on the outer `describe`, then each individual `test()` additionally gets `@smoke` or `@regression` depending on how critical/expensive it is. Use this when a suite has a mix of fast sanity checks and slower/more thorough ones.

Add more tags as the suite grows (e.g. `@critical`, `@cross-browser`) — apply them the same way:

```ts
test.describe('Login', { tag: ['@ui', '@regression'] }, () => {
  test('...', async ({ page }) => { ... });
});
```

Run a subset by tag with `--grep`:

```bash
npx playwright test --grep @api
npx playwright test --grep @regression
```

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env   # adjust values if needed
```

## Environment variables (`.env`)

| Variable             | Purpose                                  | Default (`.env.example`)          |
|----------------------|-------------------------------------------|-------------------------------------|
| `BASE_URL`           | Target app URL used by tests and `playwright.config.ts`'s `use.baseURL` | `https://try.satorixr.com/login` |
| `AUTH_STORAGE_STATE` | Path to the saved logged-in session used by `helpers/auth-fixtures.ts` | `./.auth/state.json` |

API tests derive the origin from `BASE_URL` (e.g. `https://try.satorixr.com`) rather than hardcoding it, so changing `BASE_URL` repoints both UI and API tests.

## Running tests

```bash
npm test              # everything (tests/ui + tests/api)
npm run test:ui        # UI suite only
npm run test:api       # API suite only
npm run test:regression # anything tagged @regression
```

## Reporting (Allure Report 3)

Test results are written to `allure-results/` by the `allure-playwright` reporter (configured in `playwright.config.ts`). Generate and view the HTML report:

```bash
npm run report:generate   # builds ./allure-report from ./allure-results
npm run report:open       # serves the report locally and opens it in your browser
```

Or do both, plus the test run itself, in one step:

```bash
run-tests.bat
```

On failure, a screenshot and video of the page are captured automatically (`use.screenshot`/`use.video` in `playwright.config.ts`) and attached to both the Playwright HTML report and the Allure report.

## Parallelization

`fullyParallel: true` runs every test concurrently (not just separate files) up to the configured `workers` count — `4` locally, `2` in CI (`process.env.CI`). Override per-run with `--workers=N`, e.g. `npx playwright test --workers=1` to debug flaky tests in isolation.

**Raising `workers` doesn't reliably speed this suite up.** We tried computing `workers` from CPU count (`os.cpus().length`, 12 on the dev machine) and it made no measurable difference — sometimes slightly faster, sometimes slower, and once introduced a new failure under load. The bottleneck for the authenticated UI tests isn't local CPU; it's the live app's backend serving dashboard data to several concurrent authenticated sessions at once. More workers just means more sessions contending for the same slow endpoint. If you want to genuinely speed up the suite, the actual lever is reducing how many fresh page loads happen in the first place (e.g. reusing one authenticated context across several tests in a file) — that's a real trade-off against per-test isolation, not yet done here.

Each Playwright worker launches its own browser **once** and reuses it for every test it runs — only the `context`/`page` are recreated per test (Playwright's default; confirmed by inspecting `browser` fixture identity across sequential tests in this project). So the per-test cost you see (~5-15s per Home test) is from context creation + navigation + waiting on the live app's data, not from repeatedly launching browsers.

Report/result output (`allure-results/`, `allure-report/`, `playwright-report/`, `test-results/`) is gitignored — regenerate it locally or in CI as needed.
