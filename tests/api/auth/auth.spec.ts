import { test, expect } from '../../../helpers/api-fixtures';

let tokenResponse: any;

test.beforeAll(async ({ dashboardApi }) => {
    tokenResponse = await dashboardApi.verifyToken();
});

test.describe('Auth API Exhaustive', { tag: ['@api', '@smoke', '@regression'] }, () => {
    test('verify_token_schema', { tag: ['@smoke'] }, () => {
        expect(tokenResponse).toHaveProperty('success');
        expect(typeof tokenResponse.success).toBe('boolean');
        expect(tokenResponse.success).toBe(true);
        
        expect(tokenResponse).toHaveProperty('user');
        expect(typeof tokenResponse.user).toBe('object');
        expect(tokenResponse.user).not.toBeNull();
    });

    test('verify_token_user_schema', { tag: ['@regression'] }, () => {
        const user = tokenResponse.user;
        
        expect(user).toHaveProperty('email');
        expect(typeof user.email).toBe('string');
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        
        expect(user).toHaveProperty('accessType');
        expect(typeof user.accessType).toBe('string');
        expect(['Creator', 'Viewer']).toContain(user.accessType);
        
        expect(user).toHaveProperty('role');
        expect(typeof user.role).toBe('string');
        expect(['Admin', 'Member']).toContain(user.role);
        
        expect(user).toHaveProperty('tenant');
        expect(typeof user.tenant).toBe('string');
        expect(user.tenant.length).toBeGreaterThan(0);
    });

    test('verify_token_has_no_unexpected_top_level_keys', { tag: ['@regression'] }, () => {
        const allowedKeys = ['success', 'user'];
        for (const key of Object.keys(tokenResponse)) {
            expect(allowedKeys).toContain(key);
        }
    });
});
