import { test, expect } from '../../helpers/api-fixtures';

test.describe('Cross API Consistency', { tag: ['@api', '@regression'] }, () => {
    test('stats_products_matches_active_products_count', async ({ dashboardApi }) => {
        const stats = await dashboardApi.getStats();
        const activeCount = await dashboardApi.getActiveProductsCount();
        
        expect(stats.products).toBe(activeCount);
    });

    test('stats_experiences_matches_scenes_count', async ({ dashboardApi }) => {
        const stats = await dashboardApi.getStats();
        const scenes = await dashboardApi.getScenes();
        
        expect(scenes.scenes.length).toBeGreaterThanOrEqual(stats.experiences);
    });

    test('analytics_overview_products_matches_stats_products', async ({ dashboardApi }) => {
        const stats = await dashboardApi.getStats();
        const portfolio = await dashboardApi.getAnalyticsPortfolio();
        
        expect(portfolio.data.overview.totalProducts).toBe(stats.products);
    });

    test('analytics_overview_experiences_matches_stats_experiences', async ({ dashboardApi }) => {
        const stats = await dashboardApi.getStats();
        const portfolio = await dashboardApi.getAnalyticsPortfolio();
        
        expect(portfolio.data.overview.totalExperiences).toBe(stats.experiences);
    });

    test('analytics_overview_users_matches_stats_users', async ({ dashboardApi }) => {
        const stats = await dashboardApi.getStats();
        const portfolio = await dashboardApi.getAnalyticsPortfolio();
        
        expect(portfolio.data.overview.totalUsers).toBe(stats.totalUsers);
    });

    test('analytics_overview_sessions_matches_stats_sessions', async ({ dashboardApi }) => {
        const stats = await dashboardApi.getStats();
        const portfolio = await dashboardApi.getAnalyticsPortfolio();
        
        expect(portfolio.data.overview.totalSessions).toBe(stats.totalSessions);
    });

    test('analytics_filter_products_match_products_api', async ({ dashboardApi }) => {
        const products = await dashboardApi.getProducts();
        const filters = await dashboardApi.getAnalyticsFilters();
        
        // Every filter product id should exist in the products list
        const productIds = new Set(products.map((p: any) => p.id));
        for (const fp of filters.data.products) {
            expect(productIds.has(fp.id)).toBe(true);
        }
    });

    test('settings_tenant_matches_auth_tenant', async ({ dashboardApi }) => {
        const auth = await dashboardApi.verifyToken();
        const settings = await dashboardApi.getSettings();
        
        expect(settings.tenant).toBe(auth.user.tenant);
    });
});
