import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

(async () => {
    const origin = 'https://try.satorixr.com';
    const statePath = path.resolve(__dirname, './.auth/state.json');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: statePath });
    const page = await context.newPage();

    console.log('Navigating to Category Manager page...');
    await page.goto(`${origin}/categories/manage`, { waitUntil: 'networkidle' });

    console.log('Page Title:', await page.title());
    
    // Headings
    const heading = page.getByRole('heading', { name: 'Category Manager' });
    const subtitle = page.getByText('Create and organize categories for the asset library.');
    const addSectionHeading = page.getByText('Add New Category', { exact: true });

    console.log('Category Manager heading visible?', await heading.isVisible());
    console.log('Subtitle visible?', await subtitle.isVisible());
    console.log('Add New Category heading visible?', await addSectionHeading.isVisible());

    // Inputs
    const categoryNameInput = page.getByPlaceholder('Enter category name');
    const subCategoryNameInput = page.getByPlaceholder('Enter a sub-category name');
    const saveCategoryBtn = page.getByRole('button', { name: 'Save category' });

    console.log('Category name input visible?', await categoryNameInput.isVisible());
    console.log('Sub-category input visible?', await subCategoryNameInput.isVisible());
    console.log('Save category button visible?', await saveCategoryBtn.isVisible());

    // Table elements
    const categoriesCountHeader = page.getByText(/Categories \(\d+\)/);
    const reloadBtn = page.getByRole('button', { name: 'Reload' });
    const nameCol = page.getByRole('columnheader', { name: 'Category name' });
    const subCol = page.getByRole('columnheader', { name: 'Sub-category' });
    const actionsCol = page.getByRole('columnheader', { name: 'Actions' });

    console.log('Categories count header visible?', await categoriesCountHeader.isVisible());
    console.log('Reload button visible?', await reloadBtn.isVisible());
    console.log('Name col visible?', await nameCol.isVisible());
    console.log('Sub col visible?', await subCol.isVisible());
    console.log('Actions col visible?', await actionsCol.isVisible());

    await browser.close();
})();
