import { test, expect } from '../../../helpers/api-fixtures';

let settingsResponse: any;

test.beforeAll(async ({ dashboardApi }) => {
    settingsResponse = await dashboardApi.getSettings();
});

test.describe('Settings API Exhaustive', { tag: ['@api', '@regression'] }, () => {
    test('settings_response_has_expected_keys', () => {
        expect(settingsResponse).toHaveProperty('success');
        expect(settingsResponse.success).toBe(true);
        expect(settingsResponse).toHaveProperty('settings');
        expect(settingsResponse).toHaveProperty('tenant');
    });

    test('settings_object_has_all_fields_with_correct_types', () => {
        const settings = settingsResponse.settings;
        
        expect(typeof settings.companyName).toBe('string');
        expect(typeof settings.companyColor).toBe('string');
        expect(typeof settings.companyLogo).toBe('string');
        
        expect(settings).toHaveProperty('features');
        expect(typeof settings.features).toBe('object');
        expect(typeof settings.features.analytics).toBe('boolean');
        expect(typeof settings.features.sharing).toBe('boolean');
        expect(typeof settings.features.collaboration).toBe('boolean');
        expect(typeof settings.features.customBranding).toBe('boolean');
        expect(typeof settings.features.digitalTwin).toBe('boolean');
        expect(typeof settings.features.aiFeatures).toBe('boolean');
        expect(typeof settings.features.watermarkEnabled).toBe('boolean');

        expect(typeof settings.createdAt).toBe('string');
        expect(typeof settings.updatedAt).toBe('string');
    });
});
