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
        // displayTitle and productId are legitimately absent on some scenes (older/
        // unlinked entries) — confirmed against live data, not every scene has them.
        const requiredFields = ['id', 'name', 'productIds', 'description', 'type', 'status'];
        for (const scene of scenesResponse.scenes) {
            for (const field of requiredFields) {
                expect(scene).toHaveProperty(field);
            }
        }
    });

    test('every_scene_field_types_are_correct', { tag: ['@regression'] }, () => {
        for (const scene of scenesResponse.scenes) {
            expect(typeof scene.id).toBe('string');
            expect(scene.id.length).toBeGreaterThan(0);
            expect(typeof scene.name).toBe('string');
            if (scene.displayTitle !== undefined) {
                expect(typeof scene.displayTitle).toBe('string');
            }
            if (scene.productId !== undefined) {
                expect(typeof scene.productId).toBe('string');
            }
            expect(typeof scene.status).toBe('string');
        }
    });

    test('every_scene_has_valid_status', { tag: ['@regression'] }, () => {
        const validStatuses = ['published', 'draft', 'archived'];
        for (const scene of scenesResponse.scenes) {
            expect(validStatuses).toContain(scene.status);
        }
    });

    test('every_scene_date_is_valid_iso8601', { tag: ['@regression'] }, () => {
        for (const scene of scenesResponse.scenes) {
            if (scene.date) {
                expect(typeof scene.date).toBe('string');
                const parsed = new Date(scene.date);
                expect(parsed.toString()).not.toBe('Invalid Date');
            }
        }
    });

    test('every_scene_productId_is_in_productIds', { tag: ['@regression'] }, () => {
        for (const scene of scenesResponse.scenes) {
            if (scene.productId !== undefined) {
                expect(scene.productIds).toContain(scene.productId);
            }
        }
    });

    test('every_scene_id_is_unique', { tag: ['@regression'] }, () => {
        const ids = scenesResponse.scenes.map((s: any) => s.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });
});
