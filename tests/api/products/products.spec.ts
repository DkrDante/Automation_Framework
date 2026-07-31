import { test, expect } from '../../../helpers/api-fixtures';

let productsResponse: any[];

test.beforeAll(async ({ dashboardApi }) => {
    productsResponse = await dashboardApi.getProducts();
});

test.describe('Products API Exhaustive Base', { tag: ['@api', '@smoke', '@regression'] }, () => {
    test('products_returns_array', { tag: ['@smoke'] }, () => {
        expect(Array.isArray(productsResponse)).toBe(true);
        expect(productsResponse.length).toBeGreaterThan(0);
    });

    test('every_product_has_required_fields', { tag: ['@regression'] }, () => {
        for (const product of productsResponse) {
            expect(product).toHaveProperty('id');
            expect(product).toHaveProperty('name');
            expect(product).toHaveProperty('type');
            expect(product).toHaveProperty('status');
        }
    });

    test('every_product_field_types_are_correct', { tag: ['@regression'] }, () => {
        for (const product of productsResponse) {
            expect(typeof product.id).toBe('string');
            expect(typeof product.name).toBe('string');
            if (product.type !== null) {
                expect(typeof product.type).toBe('string');
            }
            if (product.date) {
                expect(typeof product.date).toBe('string');
            }
            expect(typeof product.modelCount).toBe('number');
            expect(Number.isInteger(product.modelCount)).toBe(true);
            expect(typeof product.experienceCount).toBe('number');
            expect(Number.isInteger(product.experienceCount)).toBe(true);
        }
    });
});
