# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Playwright + TypeScript test automation for **SatoriXR** (`https://try.satorixr.com`), a live hosted app (not run locally). All UI/API tests hit the real deployed backend — there is no local server to start. Reporting via Allure Report 3.

## Commands

```bash
npm install
npx playwright install chromium
cp .env.example .env          # set BASE_URL / AUTH_STORAGE_STATE if needed

npm test                      # everything (tests/ui + tests/api + tests/cross)
npm run test:ui                # tests/ui only
npm run test:api               # tests/api only
npm run test:regression        # anything tagged @regression
npx playwright test --grep @smoke        # any tag, ad hoc
npx playwright test tests/ui/home/home.spec.ts   # single file
npx playwright test tests/ui/home/home.spec.ts -g "Overview heading"  # single test
npx playwright test --workers=1          # debug flaky tests in isolation

npm run report:generate       # builds ./allure-report from ./allure-results
npm run report:open           # serves the report locally and opens it in your browser
./run-tests.sh                 # clean + run + generate + open report, one step (run-tests.bat on Windows)
```

No lint/typecheck script is defined in `package.json`; `tsc --noEmit` against `tsconfig.json` is the closest equivalent if type errors need checking.

## Authentication

The app gates most pages behind email-OTP login, which cannot be driven end-to-end in an automated test. Instead, a pre-generated session is reused:

```bash
npx playwright codegen --save-storage=.auth/state.json https://try.satorixr.com/login
```

Log in manually (complete the OTP step) then close the browser — cookies/localStorage are saved to `.auth/state.json` (gitignored, expires with the session). Regenerate it whenever authenticated tests start failing with a 401/redirect-to-login.

- `tests/ui/Login` imports `test`/`expect` from `@playwright/test` directly — it needs a clean, unauthenticated context.
- Everything else authenticated-UI imports from `helpers/auth-fixtures.ts` instead, which overrides Playwright's `storageState` to point at `.auth/state.json`.
- API tests get the same session via `helpers/api-fixtures.ts`, which additionally reads the `auth_token` out of `.auth/state.json`'s localStorage and sends it as a `Bearer` header on a `request` context — this is because some API routes aren't covered by cookie auth alone.
- `helpers/cross-fixtures.ts` just re-exports `api-fixtures`'s `test` with `storageState` applied again (used by `tests/cross`).

## Architecture

**Page Object Model** — every page object in `pages/` extends `pages/base-page.ts`, which wraps `goto`/`waitForLoad`/`title`. Two non-obvious conventions baked into `BasePage.goto()` and every page's `open()`:

- `goto()` uses `waitUntil: 'domcontentloaded'`, not Playwright's default `'load'` — the app never reliably fires `load` (likely persistent polling/websocket connections), so `'load'` causes spurious 30s timeouts even once the page is fully usable. (One exception: `category-management-page.ts` uses `networkidle` directly instead of `super.goto()` — be aware page objects aren't fully consistent here.)
- Pages whose real content loads asynchronously after the shell renders (e.g. `home-page.ts`) wait in `open()` for one concrete, known-slow element (e.g. the "Total Products" card, up to 30s) before returning, so every test built on that page object isn't separately racing the same slow API. Follow this pattern for any new async-loading page rather than scattering ad-hoc timeouts across tests.

**Test layers** — `tests/` is split by how the test drives the app:
- `tests/ui/` — browser-driven, via the `page` fixture.
- `tests/api/` — HTTP-level, via the `request` fixture (`dashboardApi` from `helpers/api-fixtures.ts`), no browser.
- `tests/cross/` — asserts a UI/API layer's numbers reconcile with another's (e.g. `products_count_vs_stats.spec.ts` checks `/api/stats` totals against `/api/products`, `/api/scenes`, `/api/new-analytics/portfolio`, `/api/settings`). Note: `README.md`'s "Project structure" section says cross-layer tests are "intentionally out of scope for now" — that statement is stale; `tests/cross/` exists and is exercised by `npm test`. Trust the code over that line of the README.

**API access** — all HTTP calls to the app go through `services/api_service.ts`'s `DashboardAPIService` (one method per endpoint, each wrapped in an Allure `test.step`, each throwing a typed `APIError` on non-200). Add new endpoints there rather than calling `request.get()` ad hoc from a spec.

**Data-driven, atomic tests** — `tests/ui/home/home.spec.ts` is the reference pattern for new UI suites: expected content lives in a `fixtures/*.json` file, and the spec generates one `test()` per data item at module-load time (not a loop inside a single test), so each check gets its own row in the report and fails independently. Prefer many single-assertion tests over one test with several assertions.

**Tags** — set via Playwright's `tag` option on `test.describe`/`test`, not a separate mechanism:

| Tag | Meaning |
|---|---|
| `@ui` | `tests/ui` |
| `@api` | `tests/api` |
| `@regression` | core regression suite |
| `@smoke` | fast, critical-path check |

Apply blanket at `describe` level when every test in a file is equally critical/expensive (`tests/ui/Login`, `tests/api/manifest`); apply per-test when a suite mixes fast sanity checks with slower ones (`tests/ui/home`, `@ui` on the describe + `@smoke`/`@regression` per test).

## Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `BASE_URL` | Target app URL, used by `playwright.config.ts`'s `use.baseURL` and by page objects/API service to derive the origin |
| `AUTH_STORAGE_STATE` | Path to the saved logged-in session (default `./.auth/state.json`) |

API tests derive the origin from `BASE_URL` rather than hardcoding it — changing `BASE_URL` repoints both UI and API tests at once.

## Parallelization

`fullyParallel: true`, `workers: 4` locally / `2` in CI (`playwright.config.ts`). Raising `workers` further does not reliably speed the suite up — this was tried (CPU-count-based workers) and made no measurable difference, since the bottleneck is the live app's backend serving dashboard data to concurrent authenticated sessions, not local CPU. The actual lever for speed would be reducing fresh page loads (e.g. reusing one authenticated context across tests in a file), which is a real trade-off against per-test isolation and hasn't been done.

Each worker launches its own browser once and reuses it across tests; only `context`/`page` are recreated per test.

Report/result output (`allure-results/`, `allure-report/`, `playwright-report/`, `test-results/`) is gitignored — regenerate as needed, don't hand-edit or commit it.
