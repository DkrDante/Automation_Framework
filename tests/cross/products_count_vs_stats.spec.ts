import { test, expect } from '../../helpers/api-fixtures';

test.describe('Products Count vs Stats', { tag: ['@api', '@regression'] }, () => {
    test('stats_products_matches_active_products_count', { tag: ['@regression'] }, async ({ dashboardApi }) => {
        const stats = await dashboardApi.getStats();
        const activeCount = await dashboardApi.getActiveProductsCount();
        
        expect(stats.products).toBe(activeCount);
    });
});
