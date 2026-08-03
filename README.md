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
services/         API service classes (DashboardAPIService — typed wrapper over /api/*)
helpers/          Shared test utilities/fixtures (auth-fixtures, api-fixtures, cross-fixtures)
fixtures/         Test data (e.g. home.json — expected page content used by tests/ui/home)
.auth/            Saved logged-in session (state.json — gitignored)
tests/
  ui/             Browser-driven tests (Playwright `page` fixture)
    Login/        Unauthenticated
    home/         Authenticated (via helpers/auth-fixtures.ts)
    Experiences/  Authenticated — 3D viewer interactions (see the 3D viewer gotchas under "Page Object Model" below)
  api/            HTTP-level tests (Playwright `request` fixture, no browser)
  consistency/    Cross-checks between two sources of truth (UI vs API, or API vs API)
    home/         Home dashboard cards vs /api/stats
    experiences/  Experiences filters/sort vs /api/scenes + /api/products
    products/     Products filters/sort vs /api/products
    analytics/    /api/new-analytics/events vs /summary + /portfolio
    usage/        Usage page credits (UI) vs /api/credits
    api/          Cross-endpoint checks not tied to one page (stats/analytics/settings/auth)
playwright.config.ts
run-tests.bat     Windows: runs the suite then generates + opens the Allure report
run-tests.sh      macOS/Linux/Git Bash: same, via `npm run test:report`
```

Tests are split into `tests/ui`, `tests/api`, and `tests/consistency` so each layer can be run, tagged, and reported on independently. Add new suites under whichever folder matches how the test drives the app: purely through the browser, purely over HTTP, or — if it asserts that two sources of truth agree (a UI count matches an API response, or one API response matches another) — under `tests/consistency`, partitioned by the page/feature it's validating (see "Consistency tests" below).

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

**Gotcha — don't rely on the app redirecting you.** `LoginPage.open()` navigates straight to `/login` rather than to `BASE_URL`'s root and trusting the app to redirect. The SPA paints its dashboard shell *first* and only settles on `/login` once the auth check resolves, so a root-then-redirect navigation lets assertions run against that intermediate shell — where every login locator is absent and the URL isn't `/login` yet. This reliably failed whenever the machine was under load and passed when it wasn't, which is the signature of a race rather than a broken locator.

**Gotcha — the 3D viewer exposes no camera API:** [`pages/experience-viewer-page.ts`](pages/experience-viewer-page.ts) drives the WebGL/three.js experience viewer (zoom, rotate) that opens from an experience's "View" button ([`pages/experiences-page.ts`](pages/experiences-page.ts)). Unlike a typical "read `window.camera.position.z`" approach to testing 3D scenes, this app exposes no `window.camera` or any camera-shaped object at all (confirmed by a recursive scan of `window`), and no zoom/rotate UI controls either — interactions are wheel/drag directly on the `<canvas>`. So zoom/rotate can only be verified by capturing the rendered canvas frame before and after the interaction and asserting it changed — either via a raw `Buffer` compare or Playwright's built-in `toHaveScreenshot()` pixel diffing. This is coarser than a real camera-property assertion — it tells you *something* rendered differently, not *what* — and is sensitive to non-deterministic rendering (see the loading-overlay gotcha below).

**Gotcha — "overlay hidden" is not "scene rendered":** the viewer's "Loading experience..." overlay disappearing does not mean the model is ready. The app applies the experience's background *last*, so there's a window where the canvas stably shows an unstyled grey scene — long enough that a screenshot taken then looks legitimately settled (Playwright's own stability check only compares two frames ~100ms apart, which a slow progressive load easily satisfies mid-render). This produced a 422,034-pixel "failure" that was really a mid-load capture. `ExperienceViewerPage.waitForModelToLoad()` therefore waits on the authoritative signal — **the rendered frame itself has stopped changing** (3 consecutive byte-identical canvas screenshots, 500ms apart), which subsumes overlay flicker, late textures, and camera settling in one check. It also soft-waits for the background gradient (a cheap app-specific hint) and takes an explicit `timeoutMs` that callers must keep *below* their test timeout — otherwise the wait is killed mid-flight and surfaces as a confusing unrelated "test timeout" rather than a real diagnosis.

**Gotcha — WebGL output is not bit-exact, so snapshots need a tolerance:** there are **no snapshot tests in the suite any more** — the 3D viewer snapshot spec was removed and archived (with its baseline PNG) under the gitignored `local-archive/experiences-snapshot-test/`, see the README in that folder to restore it. Keep its lesson if you ever add one back: `toHaveScreenshot()` defaults to `maxDiffPixels: 0`, meaning a *single* differing pixel fails. Anti-aliasing on UI edges alone reliably produces 1-2 stray pixels between runs of the same unchanged scene, so those assertions had to pass `{ maxDiffPixels: 100 }` (~0.02% of the frame). An actual zoom moves >400,000 pixels, so the tolerance absorbed render noise without weakening the assertion. If you add snapshot tests over other canvas/WebGL content, budget a similar tolerance rather than assuming pixel-exact reproducibility.

## Authentication

The app gates most pages behind an email-OTP login, which can't be driven end-to-end in an automated test (there's no inbox to read the code from). Instead, [`helpers/auth-fixtures.ts`](helpers/auth-fixtures.ts) exports a `test`/`expect` pair that overrides Playwright's `storageState` option, so any spec importing from it runs with an already-authenticated browser context.

- **Login spec** (`tests/ui/Login`) imports `test`/`expect` from `@playwright/test` directly — it needs a clean, unauthenticated context.
- **Everything else** (e.g. `tests/ui/home`) imports from `../../../helpers/auth-fixtures` instead.

To generate the session it reuses:

```bash
npx playwright codegen --save-storage=.auth/state.json https://try.satorixr.com/login
```

Log in manually in the opened browser (complete the email OTP step), then close the window — Playwright saves cookies/localStorage to `.auth/state.json`. That file is gitignored and expires with the session, so regenerate it whenever authenticated tests start failing with a 401/redirect-to-login.

## API service layer

[`services/api_service.ts`](services/api_service.ts) exports `DashboardAPIService`, a typed wrapper over the app's `/api/*` endpoints (`getStats`, `getProducts`, `getScenes`, `getCategories`, `getSettings`, `getUsers`, `getAnalyticsPortfolio`, `getAnalyticsFilters`, `verifyToken`, plus small derived helpers like `getActiveProductsCount`). It's the API-test equivalent of a page object: every endpoint call is wrapped in `test.step(...)` so it shows up named in the Playwright/Allure report, and a non-200 response throws a typed `APIError` instead of returning a malformed body silently.

[`helpers/api-fixtures.ts`](helpers/api-fixtures.ts) provides a `dashboardApi` worker-scoped fixture that constructs `DashboardAPIService` with an authenticated `APIRequestContext` (it reads the bearer token out of `.auth/state.json`, the same session file the UI tests use). Plain API suites (`tests/api/*`) import `test`/`expect` from there directly.

[`helpers/cross-fixtures.ts`](helpers/cross-fixtures.ts) layers `storageState` on top of `api-fixtures`, giving a single `test` that has **both** an authenticated `page` (browser) and `dashboardApi` (HTTP) available in the same test — this is what `tests/consistency` specs use.

## Consistency tests (cross-checking two sources of truth)

`tests/consistency` holds tests that assert two independent sources agree, rather than testing either source in isolation:

```
tests/consistency/
  home/          Dashboard cards (UI) vs /api/stats
  experiences/   Category/status/sort filters (UI) vs /api/scenes + /api/products
  products/      Category/status/sort filters (UI) vs /api/products
  analytics/     Analytics events (API) vs the summary/portfolio aggregations of the same data
  usage/         Credits consumed + per-user breakdown (UI) vs /api/credits
  api/           Cross-endpoint checks not tied to one page (stats vs analytics vs settings vs auth)
```

Partition new consistency suites by the page/feature they validate, same as `tests/ui`/`tests/api`; if a check spans multiple endpoints with no single owning page (like the existing `api/` bucket), that's the fallback location.

The pattern, illustrated by [`tests/consistency/experiences/experiences_filters.spec.ts`](tests/consistency/experiences/experiences_filters.spec.ts): the Experiences page has no server-side filter endpoint — category/sort/status are all applied client-side against the `/api/scenes` + `/api/products` payloads already fetched on load (confirmed by tracing the live app's network requests while operating each filter — no new request fired). So the test fetches that same raw data via `dashboardApi`, replicates the app's own filtering/sorting logic in plain JS, and asserts the UI's rendered card titles match exactly, in order:

```ts
test('category_filter_matches_linked_products_in_api', async ({ page, dashboardApi }) => {
  const [scenesResponse, products] = await Promise.all([
    dashboardApi.getScenes(),
    dashboardApi.getProducts(),
  ]);
  const automotiveProductIds = new Set(
    products.filter(p => p.category === 'automotive').map(p => p.id)
  );
  // Replicate the app's own client-side filter + sort, then take the first page.
  const expected = scenesResponse.scenes
    .filter(s => s.status !== 'archived' && automotiveProductIds.has(s.productId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12)
    .map(s => s.name);

  const experiencePage = new ExperiencePage(page);
  await experiencePage.open();
  await experiencePage.filterByCategory('Automotive');

  expect(await experiencePage.visibleCardTitles()).toEqual(expected);
});
```

**Gotcha — the card title is `scene.name`, not `scene.displayTitle`:** these two fields can differ (one real scene is named `"Excavator (Do not Edit)"` but has `displayTitle: "Earth Mover"`). Building the expected list off the wrong field produces a mismatch that looks like a UI bug but is actually a test bug — verify which field a card actually renders (e.g. via a quick `page.evaluate` dump) before writing the comparison, rather than assuming the "nicer-sounding" field is the one displayed.

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

| Tag             | Meaning                                            |
|-----------------|------------------------------------------------------|
| `@ui`           | Browser-driven test (`tests/ui`)                    |
| `@api`          | HTTP-level test (`tests/api`)                       |
| `@consistency`  | Cross-check between two sources of truth (`tests/consistency`) |
| `@regression`   | Part of the core regression suite                   |
| `@smoke`        | Fast, critical-path check                           |

Two levels of granularity are in use, pick whichever fits the suite:

- **Blanket, describe-level** (`tests/ui/Login`, `tests/api/manifest`, everything in `tests/consistency`) — every test in the file gets the same tags: `{ tag: ['@ui', '@regression'] }` on `test.describe`.
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
| `HEADED`             | Set to `true` to run with a visible browser window; anything else (including unset) runs headless | unset (headless) |

API tests derive the origin from `BASE_URL` (e.g. `https://try.satorixr.com`) rather than hardcoding it, so changing `BASE_URL` repoints both UI and API tests.

## Running tests

```bash
npm test                 # everything (tests/ui + tests/api + tests/consistency)
npm run test:ui           # UI suite only
npm run test:api          # API suite only
npm run test:regression   # anything tagged @regression
npx playwright test tests/consistency   # consistency suite only (no dedicated npm script yet)

HEADED=true npx playwright test tests/ui/Login   # watch it run in a real browser window
```

## Reporting (Allure Report 3)

Test results are written to `allure-results/` by the `allure-playwright` reporter (configured in `playwright.config.ts`). Generate and view the HTML report:

```bash
npm run report:generate   # builds ./allure-report from ./allure-results (allure awesome)
npm run report:open       # serves ./allure-report locally and opens it in your browser
```

Or do both, plus the test run itself, in one step:

```bash
run-tests.bat   # Windows
./run-tests.sh  # macOS/Linux/Git Bash — also invoked by `npm run test:report`
```

Both scripts clean `allure-results`/`allure-report`, run the full suite, then generate and open the report.

On failure, a screenshot and video of the page are captured automatically (`use.screenshot`/`use.video` in `playwright.config.ts`) and attached to both the Playwright HTML report and the Allure report. Tests can also attach their own images explicitly via `testInfo.attach(name, { body, contentType })` — useful for canvas/WebGL work, where attaching the before/after frames lets a reviewer see the effect directly in the report rather than just a pass/fail.

## Parallelization

`fullyParallel: true` runs every test concurrently (not just separate files) up to the configured `workers` count — `4` locally, `2` in CI (`process.env.CI`). Override per-run with `--workers=N`, e.g. `npx playwright test --workers=1` to debug flaky tests in isolation.

**Raising `workers` doesn't reliably speed this suite up.** We tried computing `workers` from CPU count (`os.cpus().length`, 12 on the dev machine) and it made no measurable difference — sometimes slightly faster, sometimes slower, and once introduced a new failure under load. The bottleneck for the authenticated UI tests isn't local CPU; it's the live app's backend serving dashboard data to several concurrent authenticated sessions at once. More workers just means more sessions contending for the same slow endpoint. If you want to genuinely speed up the suite, the actual lever is reducing how many fresh page loads happen in the first place (e.g. reusing one authenticated context across several tests in a file) — that's a real trade-off against per-test isolation, not yet done here.

Each Playwright worker launches its own browser **once** and reuses it for every test it runs — only the `context`/`page` are recreated per test (Playwright's default; confirmed by inspecting `browser` fixture identity across sequential tests in this project). So the per-test cost you see (~5-15s per Home test) is from context creation + navigation + waiting on the live app's data, not from repeatedly launching browsers.

**Wall-clock timings here are noise-dominated — don't tune against them.** Four identical full-suite runs came in at 75s, 78s, 94s and 122s, with `ui/Experiences` alone swinging 32s→50s and `consistency/home` 26s→54s between runs. A single before/after comparison of total runtime tells you nothing, because the spread between identical runs is larger than most optimisations. If you do attempt optimisation work, measure something that isn't drowned in that variance — run `--reporter=json` and analyse per-test `startTime`/`duration`/`workerIndex` for idle gaps, worker restarts (distinct `workerIndex` exceeding the configured worker count proves a restart), and duplicated `beforeAll` work — and expect to have to justify the change on structure rather than on a stopwatch.

**Don't reach for a shared browser context to speed up UI tests.** It's the obvious idea — load the dashboard once per worker instead of once per test — but Playwright's automatic artifacts (`screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, `trace`) are all wired into the built-in **test-scoped** `context`/`page` fixtures. A worker-scoped context created from the `browser` fixture bypasses that machinery: video is recorded per BrowserContext, so you would get one unattributable file spanning every test that worker ran, and failure screenshots and traces would not be collected at all. Debugging the 3D snapshot test depended entirely on those artifacts, so that is a bad trade.

Report/result output (`allure-results/`, `allure-report/`, `playwright-report/`, `test-results/`) is gitignored — regenerate it locally or in CI as needed.
