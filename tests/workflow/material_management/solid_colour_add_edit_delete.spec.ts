import { test, expect } from '../../../helpers/cross-fixtures';
import { MaterialManagementPage } from '../../../pages/material-management-page';

const MATERIAL_NAME = 'AutomationTestMaterial';
const INITIAL_COLOR = '#ff5733';
const UPDATED_COLOR = '#00ff00';

test.use({ video: 'on' });

test.describe('Workflow — Material Management: add, edit, then delete a Solid Colour material', { tag: ['@workflow', '@regression'] }, () => {
  test.afterEach(async ({ dashboardApi }) => {
    const { items } = await dashboardApi.getMaterialPresets();
    const leftover = items.find((m: any) => m.name === MATERIAL_NAME);
    if (leftover) await dashboardApi.deleteMaterialPreset(leftover.id);
  });

  test('add "AutomationTestMaterial" solid colour, edit its colour, then delete it', async ({ page, dashboardApi }) => {
    const matPage = new MaterialManagementPage(page);

    await test.step('Open the Material Management page', async () => {
      await matPage.open();
      await expect(matPage.heading).toBeVisible();
    });

    await test.step('Click "Add New"', async () => {
      await matPage.addNewBtn.click();
      await expect(matPage.solidColourOption).toBeVisible();
    });

    await test.step('Click "Solid Colour"', async () => {
      await matPage.solidColourOption.click();
      await expect(matPage.addSolidColourHeading).toBeVisible();
    });

    await test.step(`Type "${MATERIAL_NAME}" into the material name field`, async () => {
      await matPage.nameInput.fill(MATERIAL_NAME);
      await expect(matPage.nameInput).toHaveValue(MATERIAL_NAME);
    });

    await test.step('Click the colour input and choose a colour', async () => {
      await matPage.colorInput.fill(INITIAL_COLOR);
      await expect(matPage.colorInput).toHaveValue(INITIAL_COLOR);
    });

    await test.step('Submit the Upload Solid Colour form', async () => {
      await matPage.uploadSolidColourBtn.click();
      await expect(matPage.uploadSuccessMessage()).toBeVisible({ timeout: 20000 });
    });

    await test.step('Verify creation — material card appears with name and "General" category', async () => {
      const card = matPage.materialCard(MATERIAL_NAME);
      await expect(card).toBeVisible();
      await expect(card.getByText('General')).toBeVisible();
    });

    await test.step('Cross-verify with API — material now present in /api/material-presets', async () => {
      const { items } = await dashboardApi.getMaterialPresets();
      expect(items.some((m: any) => m.name === MATERIAL_NAME)).toBe(true);
    });

    await test.step('Click the Edit icon on the created material', async () => {
      await matPage.editBtn(MATERIAL_NAME).click();
      await expect(matPage.editHeading(MATERIAL_NAME)).toBeVisible();
    });

    await test.step('Change the colour and save', async () => {
      await matPage.colorInput.fill(UPDATED_COLOR);
      await expect(matPage.colorInput).toHaveValue(UPDATED_COLOR);
      await matPage.saveChangesBtn.click();
    });

    await test.step('Verify the edit — form closes and the material card is still present', async () => {
      await expect(matPage.editHeading(MATERIAL_NAME)).not.toBeVisible();
      await expect(matPage.materialCard(MATERIAL_NAME)).toBeVisible();
    });

    await test.step('Click the Delete icon and confirm the native browser dialog', async () => {
      page.once('dialog', async (dialog) => {
        expect(dialog.message()).toBe('Delete this material? This cannot be undone.');
        await dialog.accept();
      });
      await matPage.deleteBtn(MATERIAL_NAME).click();
    });

    await test.step('Verify deletion — material card removed from the list', async () => {
      await expect(matPage.materialCard(MATERIAL_NAME)).toHaveCount(0);
    });

    await test.step('Cross-verify with API — material no longer present in /api/material-presets', async () => {
      const { items } = await dashboardApi.getMaterialPresets();
      expect(items.some((m: any) => m.name === MATERIAL_NAME)).toBe(false);
    });
  });
});
