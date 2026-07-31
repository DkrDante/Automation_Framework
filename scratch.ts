import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

(async () => {
    const origin = 'https://try.satorixr.com';
    const statePath = path.resolve(__dirname, './.auth/state.json');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: statePath });
    const page = await context.newPage();

    console.log('Navigating to home page...');
    await page.goto(`${origin}/home`, { waitUntil: 'networkidle' });

    // 1. Inspect Analytics UI
    console.log('\n================ Analytics UI ================');
    const analyticsBtn = page.getByText('Analytics', { exact: true });
    if (await analyticsBtn.isVisible()) {
        await analyticsBtn.click();
        await page.waitForTimeout(2000);
        console.log('URL:', page.url());
        console.log('Title:', await page.title());
        const texts = await page.locator('h1, h2, h3, h4, th, button, a').allInnerTexts();
        console.log('Sample UI texts:', texts.map(h => h.trim()).filter(h => h.length > 0).slice(0, 20));
    }

    // 2. Inspect Settings -> Usage UI
    console.log('\n================ Settings -> Usage UI ================');
    const settingsBtn = page.getByText('Settings', { exact: true });
    if (await settingsBtn.isVisible()) {
        await settingsBtn.click();
        await page.waitForTimeout(1000);
    }
    const usageBtn = page.getByText('Usage', { exact: true });
    if (await usageBtn.isVisible()) {
        await usageBtn.click();
        await page.waitForTimeout(2000);
        console.log('URL:', page.url());
        console.log('Title:', await page.title());
        const texts = await page.locator('h1, h2, h3, h4, th, button, a').allInnerTexts();
        console.log('Sample UI texts:', texts.map(h => h.trim()).filter(h => h.length > 0).slice(0, 20));
    } else {
        console.log('Usage button not found or visible');
    }

    await browser.close();
})();
