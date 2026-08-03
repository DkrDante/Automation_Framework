import path from 'node:path';
import { test, expect } from '../../../helpers/cross-fixtures';
import { BackgroundManagementPage } from '../../../pages/background-management-page';

const HDRI_NAME = 'sky';
const HDRI_FIXTURE = path.resolve(__dirname, '../../../fixtures/sky.hdr');

test.use({ video: 'on' });

test.describe('Workflow — Background Management: upload then delete an HDRI', { tag: ['@workflow', '@regression'] }, () => {
  test.afterEach(async ({ dashboardApi }) => {
    const { items } = await dashboardApi.getHdris();
    const leftover = items.find((i: any) => i.name === HDRI_NAME);
    if (leftover) await dashboardApi.deleteHdri(leftover.id);
  });

  test('upload "sky" HDRI, verify success, delete it, cross-verify against /api/hdri', async ({ page, dashboardApi }) => {
    const bgPage = new BackgroundManagementPage(page);

    await test.step('Open the HDRI Manager page', async () => {
      await bgPage.open();
      await expect(bgPage.heading).toBeVisible();
    });

    await test.step('Click "+ Add New HDRI"', async () => {
      await bgPage.addNewHdriBtn.click();
      await expect(bgPage.addNewHdriHeading).toBeVisible();
    });

    await test.step(`Type "${HDRI_NAME}" into the Display name field`, async () => {
      await bgPage.displayNameInput.fill(HDRI_NAME);
      await expect(bgPage.displayNameInput).toHaveValue(HDRI_NAME);
    });

    await test.step('Click "Choose HDRI" and select sky.hdr from the fixtures folder', async () => {
      await bgPage.chooseHdriFile(HDRI_FIXTURE);
    });

    await test.step('Submit the Upload HDRI form', async () => {
      await bgPage.uploadHdriBtn.click();
    });

    await test.step('Upload success message is visible', async () => {
      // The upload POST (~4MB fixture) can take longer than the default 5s to process server-side.
      await expect(bgPage.uploadSuccessMessage(HDRI_NAME)).toBeVisible({ timeout: 20000 });
    });

    await test.step('Cross-verify with API — "sky" now present in /api/hdri', async () => {
      const { items } = await dashboardApi.getHdris();
      expect(items.some((i: any) => i.name === HDRI_NAME)).toBe(true);
    });

    await test.step(`Click the Delete icon on the uploaded "${HDRI_NAME}" row`, async () => {
      await bgPage.deleteHdriBtn(HDRI_NAME).click();
      await expect(bgPage.deleteConfirmMessage(HDRI_NAME)).toBeVisible();
    });

    await test.step('Confirm deletion in the modal', async () => {
      await bgPage.deleteConfirmBtn.click();
    });

    await test.step('Verify deletion — row removed from the HDRI Catalog table', async () => {
      await expect(bgPage.hdriRow(HDRI_NAME)).toHaveCount(0);
    });

    await test.step('Cross-verify with API — "sky" no longer present in /api/hdri', async () => {
      const { items } = await dashboardApi.getHdris();
      expect(items.some((i: any) => i.name === HDRI_NAME)).toBe(false);
    });
  });
});
