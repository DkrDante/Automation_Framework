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
        const requiredFields = [
            'id', 'name', 'type', 'status',
            'modelCount', 'experienceCount', 'category', 'scaleAxisLocks'
        ];
        for (const product of productsResponse) {
            for (const field of requiredFields) {
                expect(product).toHaveProperty(field);
            }
        }
    });

    test('every_product_field_types_are_correct', { tag: ['@regression'] }, () => {
        for (const product of productsResponse) {
            expect(typeof product.id).toBe('string');
            expect(product.id.length).toBeGreaterThan(0);
            expect(typeof product.name).toBe('string');

            if (product.type !== null) {
                expect(typeof product.type).toBe('string');
            }

            expect(typeof product.modelCount).toBe('number');
            expect(Number.isInteger(product.modelCount)).toBe(true);
            expect(product.modelCount).toBeGreaterThanOrEqual(0);

            expect(typeof product.experienceCount).toBe('number');
            expect(Number.isInteger(product.experienceCount)).toBe(true);
            expect(product.experienceCount).toBeGreaterThanOrEqual(0);
        }
    });

    test('every_product_has_description_field', { tag: ['@regression'] }, () => {
        for (const product of productsResponse) {
            expect(product).toHaveProperty('description');
            if (product.description !== null) {
                expect(typeof product.description).toBe('string');
            }
        }
    });

    test('every_product_has_sub_category_field', { tag: ['@regression'] }, () => {
        for (const product of productsResponse) {
            expect(product).toHaveProperty('subCategory');
            if (product.subCategory !== null) {
                expect(typeof product.subCategory).toBe('string');
            }
        }
    });

    test('every_product_date_is_valid_iso8601', { tag: ['@regression'] }, () => {
        for (const product of productsResponse) {
            if (product.date) {
                expect(typeof product.date).toBe('string');
                const parsed = new Date(product.date);
                expect(parsed.toString()).not.toBe('Invalid Date');
            }
        }
    });

    test('every_product_id_is_unique', { tag: ['@regression'] }, () => {
        const ids = productsResponse.map(p => p.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });
});
