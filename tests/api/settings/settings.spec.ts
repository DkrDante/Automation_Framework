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
        expect(typeof settingsResponse.tenant).toBe('string');
        expect(settingsResponse.tenant.length).toBeGreaterThan(0);
    });

    test('settings_object_has_all_fields_with_correct_types', () => {
        const settings = settingsResponse.settings;
        
        expect(typeof settings.companyName).toBe('string');
        expect(typeof settings.companyColor).toBe('string');
        // A tenant with no logo uploaded returns null here, and the branding workflow
        // spec legitimately restores the tenant to that state — null is a valid value
        // for this field, not a schema break.
        expect(settings.companyLogo === null || typeof settings.companyLogo === 'string').toBe(true);
        
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

    test('settings_company_color_is_valid_hex', () => {
        const settings = settingsResponse.settings;
        expect(settings.companyColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    test('settings_timestamps_are_valid_iso8601', () => {
        const settings = settingsResponse.settings;
        const createdAt = new Date(settings.createdAt);
        const updatedAt = new Date(settings.updatedAt);
        expect(createdAt.toString()).not.toBe('Invalid Date');
        expect(updatedAt.toString()).not.toBe('Invalid Date');
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
    });

    test('settings_company_logo_is_valid_path', () => {
        const settings = settingsResponse.settings;
        // Truthiness, not `.length` — companyLogo is null (not "") when unset, and
        // reading .length off it throws before the assertion is ever reached.
        if (settings.companyLogo) {
            expect(settings.companyLogo).toMatch(/\.(png|jpg|jpeg|svg|webp)$/i);
        }
    });
});
