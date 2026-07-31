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
            expect(typeof category.slug).toBe('string');
            expect(Array.isArray(category.subCategories)).toBe(true);

            for (const sub of category.subCategories) {
                expect(typeof sub.id).toBe('string');
                expect(typeof sub.name).toBe('string');
                expect(typeof sub.slug).toBe('string');
                expect(typeof sub.createdAt).toBe('string');
                expect(typeof sub.updatedAt).toBe('string');
            }
        }
    });
});
