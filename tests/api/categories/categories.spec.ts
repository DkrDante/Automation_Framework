import { test, expect } from '../../../helpers/api-fixtures';

let categoriesResponse: any;

test.beforeAll(async ({ dashboardApi }) => {
    categoriesResponse = await dashboardApi.getCategories();
});

test.describe('Categories API Exhaustive', { tag: ['@api', '@regression'] }, () => {
    test('categories_response_is_valid', () => {
        expect(categoriesResponse.success).toBe(true);
        expect(Array.isArray(categoriesResponse.categories)).toBe(true);
    });

    test('every_category_has_valid_schema', () => {
        for (const category of categoriesResponse.categories) {
            expect(typeof category._id).toBe('string');
            expect(typeof category.id).toBe('string');
            expect(typeof category.name).toBe('string');
            expect(category.name.length).toBeGreaterThan(0);
            expect(typeof category.slug).toBe('string');
            expect(Array.isArray(category.subCategories)).toBe(true);

            for (const sub of category.subCategories) {
                expect(typeof sub.id).toBe('string');
                expect(typeof sub.name).toBe('string');
                expect(sub.name.length).toBeGreaterThan(0);
                expect(typeof sub.slug).toBe('string');
                expect(typeof sub.createdAt).toBe('string');
                expect(typeof sub.updatedAt).toBe('string');
            }
        }
    });

    test('every_category_slug_is_lowercase_kebab', () => {
        for (const category of categoriesResponse.categories) {
            expect(category.slug).toMatch(/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/);
            for (const sub of category.subCategories) {
                expect(sub.slug).toMatch(/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/);
            }
        }
    });

    test('every_category_id_is_unique', () => {
        const ids = categoriesResponse.categories.map((c: any) => c.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    test('every_subcategory_timestamp_is_valid', () => {
        for (const category of categoriesResponse.categories) {
            for (const sub of category.subCategories) {
                const created = new Date(sub.createdAt);
                const updated = new Date(sub.updatedAt);
                expect(created.toString()).not.toBe('Invalid Date');
                expect(updated.toString()).not.toBe('Invalid Date');
                expect(updated.getTime()).toBeGreaterThanOrEqual(created.getTime());
            }
        }
    });
});
