import { test, expect } from '../../../helpers/auth-fixtures';
import { UserManagementPage } from '../../../pages/user-management-page';

test.describe('Settings — User Management UI Exhaustive', { tag: ['@ui', '@regression'] }, () => {
  test('User Management page heading is visible', { tag: ['@smoke'] }, async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(userPage.heading).toBeVisible();
  });

  test('Subheading "Manage users for your tenant" is visible', async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(userPage.subHeading).toBeVisible();
  });

  test('URL resolves to /users route', async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(page).toHaveURL(/\/users/);
  });

  test('Add New User section heading is visible', async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(userPage.addNewUserHeading).toBeVisible();
  });

  test('Email input with placeholder user@example.com is visible', async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(userPage.emailInput).toBeVisible();
  });

  test('Add User button is visible', async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(userPage.addUserBtn).toBeVisible();
  });

  test('Users count header displays total users count', async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(userPage.usersHeader).toBeVisible();
  });

  test('Users selected status text is visible', async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(userPage.usersSelectedText).toBeVisible();
  });

  test('Refresh button is visible', async ({ page }) => {
    const userPage = new UserManagementPage(page);
    await userPage.open();

    await expect(userPage.refreshBtn).toBeVisible();
  });

  test.describe('Action Buttons State on User Selection', () => {
    test('Enable and Disable access buttons are disabled when 0 users selected', async ({ page }) => {
      const userPage = new UserManagementPage(page);
      await userPage.open();

      await expect(userPage.usersSelectedText).toHaveText('0 users selected');
      await expect(userPage.enableAccessBtn).toBeDisabled();
      await expect(userPage.disableAccessBtn).toBeDisabled();
    });

    test('Selecting a user enables Enable access and Disable access buttons', async ({ page }) => {
      const userPage = new UserManagementPage(page);
      await userPage.open();

      // Check the first selectable user
      await userPage.selectUserRow(0);

      await expect(userPage.usersSelectedText).toContainText('1');
      await expect(userPage.enableAccessBtn).toBeEnabled();
      await expect(userPage.disableAccessBtn).toBeEnabled();
    });

    test('Unselecting a user disables Enable access and Disable access buttons again', async ({ page }) => {
      const userPage = new UserManagementPage(page);
      await userPage.open();

      await userPage.selectUserRow(0);
      await expect(userPage.enableAccessBtn).toBeEnabled();

      await userPage.unselectUserRow(0);
      await expect(userPage.usersSelectedText).toHaveText('0 users selected');
      await expect(userPage.enableAccessBtn).toBeDisabled();
      await expect(userPage.disableAccessBtn).toBeDisabled();
    });
  });

  test.describe('User Table Column Headers', () => {
    test('Email column header is visible', async ({ page }) => {
      const userPage = new UserManagementPage(page);
      await userPage.open();

      await expect(userPage.emailColumnHeader).toBeVisible();
    });

    test('Role column header is visible', async ({ page }) => {
      const userPage = new UserManagementPage(page);
      await userPage.open();

      await expect(userPage.roleColumnHeader).toBeVisible();
    });

    test('Login Access column header is visible', async ({ page }) => {
      const userPage = new UserManagementPage(page);
      await userPage.open();

      await expect(userPage.loginAccessColumnHeader).toBeVisible();
    });

    test('Last Signed-In column header is visible', async ({ page }) => {
      const userPage = new UserManagementPage(page);
      await userPage.open();

      await expect(userPage.lastSignedInColumnHeader).toBeVisible();
    });

    test('Actions column header is visible', async ({ page }) => {
      const userPage = new UserManagementPage(page);
      await userPage.open();

      await expect(userPage.actionsColumnHeader).toBeVisible();
    });
  });
});
