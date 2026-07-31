import { test, expect } from '../../../helpers/auth-fixtures';
import { UserManagementPage } from '../../../pages/user-management-page';

test.describe('Settings — User Management UI', { tag: ['@ui', '@regression'] }, () => {
  test('User Management page heading is visible', { tag: ['@smoke'] }, async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(userPage.heading).toBeVisible();
  });

  test('URL resolves to /users route', async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(page).toHaveURL(/\/users/);
  });

  test('Add user button is visible', async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(userPage.addUserBtn).toBeVisible();
  });

  test('Refresh button is visible', async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(userPage.refreshBtn).toBeVisible();
  });

  test('Users count header displays total users count', async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(userPage.usersHeader).toBeVisible();
  });
});
