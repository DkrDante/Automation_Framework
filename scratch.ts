import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

(async () => {
    const origin = 'https://try.satorixr.com';
    const statePath = path.resolve(__dirname, './.auth/state.json');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: statePath });
    const page = await context.newPage();

    console.log('Navigating to Branding page...');
    await page.goto(`${origin}/settings`, { waitUntil: 'networkidle' });

    console.log('Page Title:', await page.title());
    
    // Labels
    const companyLogoLabel = page.getByText('Company Logo', { exact: true });
    const companyNameLabel = page.getByText('Company Name', { exact: true });
    const companyColorLabel = page.getByText('Company Color', { exact: true });

    console.log('Company Logo label visible?', await companyLogoLabel.isVisible());
    console.log('Company Name label visible?', await companyNameLabel.isVisible());
    console.log('Company Color label visible?', await companyColorLabel.isVisible());

    // Inputs
    const companyNameInput = page.getByPlaceholder('Enter your company name');
    console.log('Company Name input visible?', await companyNameInput.isVisible());
    console.log('Company Name value:', await companyNameInput.inputValue());

    // Color input
    const colorInput = page.locator('input[value^="#"], input[placeholder*="#"]');
    console.log('Color input count:', await colorInput.count());
    if (await colorInput.count() > 0) {
        console.log('Color input value:', await colorInput.first().inputValue());
    }

    // Helper texts
    const logoHelperText = page.getByText('PNG, JPG up to 2MB. Recommended: 200x200px');
    const colorHelperText = page.getByText('This color will be used in your shared experiences');
    const charCountText = page.getByText(/\d+\/100 characters/);

    console.log('Logo helper visible?', await logoHelperText.isVisible());
    console.log('Color helper visible?', await colorHelperText.isVisible());
    console.log('Char count visible?', await charCountText.isVisible());

    await browser.close();
})();
