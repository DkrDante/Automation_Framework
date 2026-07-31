import { test, expect } from '../../../helpers/api-fixtures';

let scenesResponse: any;

test.beforeAll(async ({ dashboardApi }) => {
    scenesResponse = await dashboardApi.getScenes();
});

test.describe('Extended Scenes API Exhaustive', { tag: ['@api', '@regression'] }, () => {
    test('all_scenes_are_type_experience', () => {
        for (const scene of scenesResponse.scenes) {
            expect(scene).toHaveProperty('type');
            expect(scene.type).toBe('experience');
        }
    });

    test('all_scenes_have_product_ids_array', () => {
        for (const scene of scenesResponse.scenes) {
            expect(scene).toHaveProperty('productIds');
            expect(Array.isArray(scene.productIds)).toBe(true);
        }
    });

    test('all_scenes_have_valid_thumbnail_url', () => {
        for (const scene of scenesResponse.scenes) {
            if (scene.thumbnailUrl) {
                expect(scene.thumbnailUrl).toMatch(/^https?:\/\//);
            }
        }
    });
    
    test('all_scenes_have_description_string', () => {
        for (const scene of scenesResponse.scenes) {
            expect(scene).toHaveProperty('description');
            if (scene.description !== null) {
                expect(typeof scene.description).toBe('string');
            }
        }
    });
});
