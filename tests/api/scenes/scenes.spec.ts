import { test, expect } from '../../../helpers/api-fixtures';

let scenesResponse: any;

test.beforeAll(async ({ dashboardApi }) => {
    scenesResponse = await dashboardApi.getScenes();
});

test.describe('Scenes API Exhaustive Base', { tag: ['@api', '@smoke', '@regression'] }, () => {
    test('scenes_response_has_scenes_array', { tag: ['@smoke'] }, () => {
        expect(scenesResponse).toHaveProperty('scenes');
        expect(Array.isArray(scenesResponse.scenes)).toBe(true);
        expect(scenesResponse.scenes.length).toBeGreaterThan(0);
    });

    test('every_scene_has_required_fields', { tag: ['@regression'] }, () => {
        for (const scene of scenesResponse.scenes) {
            expect(scene).toHaveProperty('id');
            expect(scene).toHaveProperty('name');
            expect(scene).toHaveProperty('displayTitle');
            expect(scene).toHaveProperty('productId');
            expect(scene).toHaveProperty('status');
        }
    });

    test('every_scene_field_types_are_correct', { tag: ['@regression'] }, () => {
        for (const scene of scenesResponse.scenes) {
            expect(typeof scene.id).toBe('string');
            expect(typeof scene.name).toBe('string');
            expect(typeof scene.displayTitle).toBe('string');
            expect(typeof scene.productId).toBe('string');
            expect(typeof scene.status).toBe('string');
        }
    });
});
