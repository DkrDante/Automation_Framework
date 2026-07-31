import { test, expect } from '../../../helpers/api-fixtures';

let portfolioResponse: any;
let filtersResponse: any;

test.beforeAll(async ({ dashboardApi }) => {
    portfolioResponse = await dashboardApi.getAnalyticsPortfolio();
    filtersResponse = await dashboardApi.getAnalyticsFilters();
});

test.describe('Analytics API Exhaustive', { tag: ['@api', '@regression'] }, () => {
    test('portfolio_response_is_valid', () => {
        expect(portfolioResponse.success).toBe(true);
        expect(portfolioResponse).toHaveProperty('data');
        
        const data = portfolioResponse.data;
        expect(data).toHaveProperty('overview');
        expect(data).toHaveProperty('engagement');
        expect(data).toHaveProperty('experiences');

        // Check Overview
        const overview = data.overview;
        expect(typeof overview.totalEvents).toBe('number');
        expect(typeof overview.events24h).toBe('number');
        expect(typeof overview.totalProducts).toBe('number');
        expect(typeof overview.totalExperiences).toBe('number');
        expect(typeof overview.totalUsers).toBe('number');
        expect(typeof overview.totalSessions).toBe('number');
        expect(typeof overview.totalViews).toBe('number');
        expect(typeof overview.totalCompletions).toBe('number');
        expect(typeof overview.avgSessionDuration).toBe('string');
        expect(typeof overview.avgSessionsPerExperience).toBe('number');
    });

    test('filters_response_is_valid', () => {
        expect(filtersResponse.success).toBe(true);
        expect(filtersResponse).toHaveProperty('data');

        const data = filtersResponse.data;
        expect(Array.isArray(data.categories)).toBe(true);
        expect(Array.isArray(data.subCategories)).toBe(true);
        expect(Array.isArray(data.countries)).toBe(true);
        expect(Array.isArray(data.states)).toBe(true);
        expect(Array.isArray(data.deviceTypes)).toBe(true);
        expect(Array.isArray(data.browserTypes)).toBe(true);
        expect(Array.isArray(data.products)).toBe(true);

        if (data.products.length > 0) {
            expect(typeof data.products[0].id).toBe('string');
            expect(typeof data.products[0].name).toBe('string');
        }
    });
});
