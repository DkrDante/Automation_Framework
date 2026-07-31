import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
    const origin = 'https://try.satorixr.com';
    const statePath = path.resolve(__dirname, './.auth/state.json');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: statePath });
    const page = await context.newPage();

    // --- Background Management ---
    console.log('\n======= Background Management (HDRI) =======');
    await page.goto(`${origin}/hdri/manage`, { waitUntil: 'networkidle' });

    const texts = await page.locator('h1, h2, h3, h4, label, th, button, p, input').allInnerTexts();
    console.log('UI Texts:', texts.map(t => t.trim()).filter(t => t.length > 0).slice(0, 30));

    const addHdriHeading = page.getByText('Add New HDRI', { exact: true });
    const nameInput = page.getByPlaceholder('HDRI name');
    const uploadHdriBtn = page.getByRole('button', { name: 'Upload HDRI' });
    const chooseHdriBtn = page.getByRole('button', { name: 'Choose HDRI' });
    const reloadBtn = page.getByRole('button', { name: 'Reload' });
    const hdriCatalogHeader = page.getByText(/HDRI Catalog \(\d+\)/);
    const nameColHeader = page.getByRole('columnheader', { name: 'Name' });
    const fileSizeColHeader = page.getByRole('columnheader', { name: 'File Size (MB)' });
    const updatedByColHeader = page.getByRole('columnheader', { name: 'Updated By' });
    const actionsColHeader = page.getByRole('columnheader', { name: 'Actions' });

    console.log('Add New HDRI heading?', await addHdriHeading.isVisible());
    console.log('Name input?', await nameInput.isVisible());
    console.log('Upload HDRI btn?', await uploadHdriBtn.isVisible());
    console.log('Choose HDRI btn?', await chooseHdriBtn.isVisible());
    console.log('Reload btn?', await reloadBtn.isVisible());
    console.log('HDRI Catalog header?', await hdriCatalogHeader.isVisible());
    console.log('Name col header?', await nameColHeader.isVisible());
    console.log('File Size col header?', await fileSizeColHeader.isVisible());
    console.log('Updated By col header?', await updatedByColHeader.isVisible());
    console.log('Actions col header?', await actionsColHeader.isVisible());

    // --- Material Management ---
    console.log('\n======= Material Management =======');
    await page.goto(`${origin}/material-presets/manage`, { waitUntil: 'networkidle' });

    const matTexts = await page.locator('h1, h2, h3, h4, label, th, button, p').allInnerTexts();
    console.log('UI Texts:', matTexts.map(t => t.trim()).filter(t => t.length > 0).slice(0, 30));

    const matAddBtn = page.getByRole('button', { name: 'Add New' });
    const matReloadBtn = page.getByRole('button', { name: 'Reload' });
    const matHeader = page.getByText(/Materials \(\d+\)/);

    console.log('Add New btn?', await matAddBtn.isVisible());
    console.log('Reload btn?', await matReloadBtn.isVisible());
    console.log('Materials header?', await matHeader.isVisible());

    // Check table headers
    const matTableHeaders = await page.locator('th').allInnerTexts();
    console.log('Material table headers:', matTableHeaders.map(t => t.trim()).filter(t => t.length > 0));

    await browser.close();
})();
