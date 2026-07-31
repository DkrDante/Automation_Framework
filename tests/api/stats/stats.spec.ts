import { test, expect } from '../../../helpers/api-fixtures';

let statsResponse: any;

test.beforeAll(async ({ dashboardApi }) => {
    statsResponse = await dashboardApi.getStats();
});

test.describe('Dashboard Stats API Exhaustive Base', { tag: ['@api', '@smoke', '@regression'] }, () => {
    test('stats_has_all_integer_fields', { tag: ['@regression'] }, () => {
        const intFields = [
            'models', 'scenes', 'products', 'shares',
            'totalSessions', 'totalUsers', 'experiences'
        ];
        
        for (const field of intFields) {
            expect(statsResponse).toHaveProperty(field);
            expect(typeof statsResponse[field]).toBe('number');
            expect(Number.isInteger(statsResponse[field])).toBe(true);
        }
    });

    test('stats_has_all_string_fields', { tag: ['@regression'] }, () => {
        const stringFields = ['revenue', 'user', 'tenant'];
        
        for (const field of stringFields) {
            expect(statsResponse).toHaveProperty(field);
            expect(typeof statsResponse[field]).toBe('string');
        }
    });
});
