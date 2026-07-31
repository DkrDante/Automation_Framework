import { test, expect } from '../../../helpers/api-fixtures';

let productsResponse: any[];

test.beforeAll(async ({ dashboardApi }) => {
    productsResponse = await dashboardApi.getProducts();
});

test.describe('Extended Products API Exhaustive', { tag: ['@api', '@regression'] }, () => {
    test('every_product_has_valid_status', () => {
        const validStatuses = ['published', 'archived', 'draft'];
        for (const product of productsResponse) {
            expect(validStatuses).toContain(product.status);
        }
    });

    test('every_product_has_valid_thumbnail_url', () => {
        for (const product of productsResponse) {
            if (product.thumbnailUrl) {
                expect(product.thumbnailUrl).toMatch(/^https?:\/\//);
            }
        }
    });

    test('every_product_has_category_string', () => {
        for (const product of productsResponse) {
            expect(product).toHaveProperty('category');
            if (product.category !== null) {
                expect(typeof product.category).toBe('string');
            }
        }
    });

    test('every_product_has_scale_axis_locks_object', () => {
        for (const product of productsResponse) {
            expect(product).toHaveProperty('scaleAxisLocks');
            if (product.scaleAxisLocks !== null) {
                expect(typeof product.scaleAxisLocks).toBe('object');
            }
        }
    });
});
