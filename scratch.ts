import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
    const origin = 'https://try.satorixr.com';
    const statePath = path.resolve(__dirname, './.auth/state.json');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: statePath });
    const page = await context.newPage();

    // use domcontentloaded like BasePage, then inspect
    await page.goto(`${origin}/usage`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const url = page.url();
    console.log('Current URL:', url);
    console.log('Title:', await page.title());

    const all = await page.locator('h1, h2, h3, h4, h5, h6, [role=heading]').allInnerTexts();
    console.log('Headings:', all);

    const bodyText = await page.locator('body').innerText();
    console.log('Body (first 300 chars):', bodyText.slice(0, 300));

    await browser.close();
})();
