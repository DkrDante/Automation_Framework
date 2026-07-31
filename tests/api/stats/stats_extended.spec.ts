import { test, expect } from '../../../helpers/api-fixtures';

let statsResponse: any;

test.beforeAll(async ({ dashboardApi }) => {
    statsResponse = await dashboardApi.getStats();
});

test.describe('Extended Stats API Exhaustive', { tag: ['@api', '@regression'] }, () => {
    test('stats_revenue_format', () => {
        expect(typeof statsResponse.revenue).toBe('string');
        if (statsResponse.revenue !== "0") {
            expect(statsResponse.revenue).toMatch(/^\$/);
        }
    });

    test('stats_user_matches_email_format', () => {
        expect(statsResponse.user).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
    
    test('stats_tenant_not_empty', () => {
        expect(statsResponse.tenant.length).toBeGreaterThan(0);
    });
});
