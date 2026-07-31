import { test, expect } from '../../helpers/cross-fixtures';
import { HomePage } from '../../pages/home-page';

test.describe('Stats vs Home Cards', { tag: ['@cross', '@regression'] }, () => {
  let statsResponse: any;

  test.beforeAll(async ({ dashboardApi }) => {
    statsResponse = await dashboardApi.getStats();
  });

  test('stats_total_products_matches_ui_card', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();

    const productsCard = homePage.overviewCard('Total Products');
    const cardText = await productsCard.innerText();
    const match = cardText.match(/(\d+)/);
    const cardValue = match ? parseInt(match[1], 10) : -1;
    
    expect(cardValue).toBe(statsResponse.products);
  });
  
  test('stats_total_sessions_matches_ui_card', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();

    const sessionsCard = homePage.overviewCard('Total Sessions');
    const cardText = await sessionsCard.innerText();
    const match = cardText.match(/(\d+)/);
    const cardValue = match ? parseInt(match[1], 10) : -1;
    
    expect(cardValue).toBe(statsResponse.totalSessions);
  });
  
  test('stats_total_users_matches_ui_card', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();

    const usersCard = homePage.overviewCard('Total no of users');
    const cardText = await usersCard.innerText();
    const match = cardText.match(/(\d+)/);
    const cardValue = match ? parseInt(match[1], 10) : -1;
    
    expect(cardValue).toBe(statsResponse.totalUsers);
  });
});
