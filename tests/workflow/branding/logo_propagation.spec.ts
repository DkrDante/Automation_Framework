import { test, expect, STORAGE_STATE_PATH } from '../../../helpers/cross-fixtures';
import { BrandingPage } from '../../../pages/branding-page';
import { ExperiencePage } from '../../../pages/experiences-page';
import { ExperienceViewerPage } from '../../../pages/experience-viewer-page';
import brandingData from '../../../fixtures/branding_workflow.json';
import experiencesData from '../../../fixtures/experiences.json';
import fs from 'fs';
import os from 'os';
import path from 'path';

test.use({ video: 'on' });

// The branding this tenant holds when the run starts, captured live rather than read
// from the fixture. Baking the "original" values into fixtures/branding_workflow.json
// meant the cleanup restored whatever was hardcoded there instead of what was actually
// there — on a shared environment that silently overwrites real settings with a guess.
let originalCompanyName: string;
let originalCompanyLogo: string | null;

test.describe('Workflow — Company Branding: upload a logo, save, and confirm experiences still render', { tag: ['@workflow', '@regression'] }, () => {
  test.beforeAll(async ({ dashboardApi }) => {
    const { settings } = await dashboardApi.getSettings();
    originalCompanyName = settings.companyName;
    originalCompanyLogo = settings.companyLogo ?? null;
  });

  // Branding is tenant-wide persistent state, so restore it even when the test fails
  // mid-flow — otherwise a broken run leaves the test company name on the real tenant.
  test.afterAll(async ({ browser, dashboardApi }) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
    const page = await context.newPage();
    const brandingPage = new BrandingPage(page);
    await brandingPage.open();

    if (originalCompanyLogo) {
      const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
      const logoUrl = originalCompanyLogo.startsWith('http')
        ? originalCompanyLogo
        : `${origin}/api${originalCompanyLogo}`;
      const logoResponse = await fetch(logoUrl);
      const buffer = Buffer.from(await logoResponse.arrayBuffer());
      const tmpFile = path.join(os.tmpdir(), `restore-logo-${Date.now()}${path.extname(logoUrl) || '.jpg'}`);
      fs.writeFileSync(tmpFile, buffer);
      await brandingPage.uploadLogo(tmpFile);
      fs.unlinkSync(tmpFile);
    } else {
      await brandingPage.removeLogo();
    }

    await brandingPage.companyNameInput.fill(originalCompanyName);
    await brandingPage.saveAndConfirm();
    await context.close();

    const { settings } = await dashboardApi.getSettings();
    expect(settings.companyName).toBe(originalCompanyName);
    // Re-uploading the original image mints a fresh /logos/<timestamp>-<hash> path, so
    // the restored value can never string-equal the original one. Assert on presence —
    // "a logo is set again" is the property the restore is actually responsible for.
    if (originalCompanyLogo) {
      expect(settings.companyLogo).toBeTruthy();
    } else {
      expect(settings.companyLogo ?? null).toBeNull();
    }
  });

  test('upload a logo and company name, save, then confirm an experience still loads in the 3D viewer', async ({ page, dashboardApi }) => {
    // The 3D viewer wait alone budgets 60s; leave room for it plus the branding save.
    test.setTimeout(180000);

    const brandingPage = new BrandingPage(page);
    const experiencePage = new ExperiencePage(page);
    const viewerPage = new ExperienceViewerPage(page);

    await test.step('Open the Company Branding page', async () => {
      await brandingPage.open();
      await expect(brandingPage.heading).toBeVisible();
    });

    await test.step('Upload the branding logo fixture', async () => {
      await brandingPage.uploadLogo(brandingData.logo_path);
      await expect(brandingPage.logoPreview).toBeVisible();
    });

    await test.step(`Type "${brandingData.test_company_name}" into the Company Name field`, async () => {
      await brandingPage.companyNameInput.fill(brandingData.test_company_name);
      await expect(brandingPage.companyNameInput).toHaveValue(brandingData.test_company_name);
    });

    await test.step('Save the settings and verify the PUT succeeded', async () => {
      const { body } = await brandingPage.saveAndConfirm();
      expect(body.success).toBe(true);
    });

    await test.step('Verify the saved branding is reflected back in the form', async () => {
      await expect(brandingPage.companyNameInput).toHaveValue(brandingData.test_company_name);
      await expect(brandingPage.logoPreview).toHaveAttribute('src', /\/logos\//);
    });

    await test.step('Cross-verify with API — /api/settings holds the new name and logo', async () => {
      const { settings } = await dashboardApi.getSettings();
      expect(settings.companyName).toBe(brandingData.test_company_name);
      expect(settings.companyLogo).toMatch(/\/logos\//);
    });

    await test.step('Open Experiences and search for the target experience', async () => {
      await experiencePage.open();
      await expect(experiencePage.heading).toBeVisible();

      // The grid paginates at 12 and defaults to newest-first, which puts this
      // experience around 72nd of ~88 — it is never on page 1, so its "View" button
      // genuinely is not in the DOM until the search narrows the grid down to it.
      await experiencePage.search(experiencesData.search.term);
      await expect(experiencePage.cardTitles.first()).toContainText(experiencesData.search.expected_title);
    });

    await test.step('Open the experience in the 3D viewer and wait for the model to settle', async () => {
      await experiencePage.viewExperience(experiencesData.search.expected_title);
      await viewerPage.waitForModelToLoad();
      await expect(viewerPage.canvas).toBeVisible();
    });
  });
});
