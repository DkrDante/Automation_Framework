import { test, expect, STORAGE_STATE_PATH } from '../../../helpers/cross-fixtures';
import { BrandingPage } from '../../../pages/branding-page';
import { ExperiencePage } from '../../../pages/experiences-page';
import { ExperienceViewerPage } from '../../../pages/experience-viewer-page';
import brandingData from '../../../fixtures/branding_workflow.json';
import experiencesData from '../../../fixtures/experiences.json';
import fs from 'fs';
import os from 'os';
import path from 'path';

test.describe('Settings — Company Branding Logo Propagation', { tag: ['@ui', '@regression'] }, () => {
  test.afterAll(async ({ browser, dashboardApi }) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
    const page = await context.newPage();
    const brandingPage = new BrandingPage(page);
    await brandingPage.open();

    const originalLogo = brandingData.original_company_logo as string | null;
    if (originalLogo) {
      const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
      const logoUrl = originalLogo.startsWith('http') ? originalLogo : `${origin}/api${originalLogo}`;
      const logoResponse = await fetch(logoUrl);
      const buffer = Buffer.from(await logoResponse.arrayBuffer());
      const tmpFile = path.join(os.tmpdir(), `restore-logo-${Date.now()}${path.extname(logoUrl) || '.jpg'}`);
      fs.writeFileSync(tmpFile, buffer);
      await brandingPage.uploadLogo(tmpFile);
      fs.unlinkSync(tmpFile);
    } else {
      await brandingPage.removeLogo();
    }

    await brandingPage.companyNameInput.fill(brandingData.original_company_name);
    await brandingPage.saveAndConfirm();
    await context.close();

    const settingsResponse = await dashboardApi.getSettings();
    expect(settingsResponse.settings.companyName).toBe(brandingData.original_company_name);
    expect(settingsResponse.settings.companyLogo).toBe(brandingData.original_company_logo);
  });

  test('uploaded logo and company name save successfully and the experience areas remain intact', async ({ page }) => {
    test.setTimeout(120000);

    const brandingPage = new BrandingPage(page);
    await brandingPage.open();
    await brandingPage.uploadLogo(brandingData.logo_path);
    await brandingPage.companyNameInput.fill(brandingData.test_company_name);

    const { body } = await brandingPage.saveAndConfirm();

    expect(body.success).toBe(true);
    await expect(brandingPage.companyNameInput).toHaveValue(brandingData.test_company_name);
    await expect(brandingPage.logoPreview).toBeVisible();
    await expect(brandingPage.logoPreview).toHaveAttribute('src', /\/logos\//);

    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await expect(experiencePage.heading).toBeVisible();

    await experiencePage.search(experiencesData.search.term);
    await expect(experiencePage.card(experiencesData.search.expected_title)).toBeVisible();
    await experiencePage.viewExperience(experiencesData.search.expected_title);
    const viewerPage = new ExperienceViewerPage(page);
    await viewerPage.waitForModelToLoad();
    await expect(viewerPage.canvas).toBeVisible();
  });
});
