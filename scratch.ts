import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

(async () => {
    const origin = 'https://try.satorixr.com';
    const statePath = path.resolve(__dirname, './.auth/state.json');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: statePath });
    const page = await context.newPage();

    console.log('Navigating to User Management page...');
    await page.goto(`${origin}/users`, { waitUntil: 'networkidle' });

    // Check checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    console.log(`Total checkboxes found: ${count}`);

    // Check initial text and state of action buttons
    const selectionText = page.locator('text=/\\d+ users? selected/');
    console.log('Initial selection text:', await selectionText.innerText());

    const enableBtn = page.getByRole('button', { name: 'Enable access' });
    const disableBtn = page.getByRole('button', { name: 'Disable access' });
    const deleteSelectedBtn = page.getByRole('button', { name: /Delete selected/ });

    console.log('Initial Enable access disabled?', await enableBtn.isDisabled());
    console.log('Initial Disable access disabled?', await disableBtn.isDisabled());
    console.log('Initial Delete selected button text:', await deleteSelectedBtn.innerText());

    // Click the first row checkbox (index 1 if index 0 is header select all)
    if (count > 1) {
        console.log('\n--- Checking 1st user checkbox ---');
        await checkboxes.nth(1).check();
        await page.waitForTimeout(500);

        console.log('Post-select text:', await selectionText.innerText());
        console.log('Enable access enabled?', await enableBtn.isEnabled());
        console.log('Disable access enabled?', await disableBtn.isEnabled());
        console.log('Delete selected button text:', await deleteSelectedBtn.innerText());

        // Uncheck
        console.log('\n--- Unchecking user checkbox ---');
        await checkboxes.nth(1).uncheck();
        await page.waitForTimeout(500);

        console.log('Post-unselect text:', await selectionText.innerText());
        console.log('Enable access disabled?', await enableBtn.isDisabled());
    }

    await browser.close();
})();
