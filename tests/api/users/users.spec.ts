import { test, expect } from '../../../helpers/api-fixtures';

let usersResponse: any;

test.beforeAll(async ({ dashboardApi }) => {
    usersResponse = await dashboardApi.getUsers();
});

test.describe('Users API Exhaustive', { tag: ['@api', '@regression'] }, () => {
    test('users_response_is_valid', () => {
        expect(usersResponse.success).toBe(true);
        expect(Array.isArray(usersResponse.users)).toBe(true);
    });

    test('every_user_has_valid_schema', () => {
        for (const user of usersResponse.users) {
            expect(typeof user.email).toBe('string');
            expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            
            expect(typeof user.accessType).toBe('string');
            expect(typeof user.role).toBe('string');
            
            expect(typeof user.isActive).toBe('boolean');
            expect(typeof user.isProtected).toBe('boolean');
            expect(typeof user.protected).toBe('boolean');
            expect(typeof user.isSystem).toBe('boolean');
            expect(typeof user.system).toBe('boolean');

            if (user.lastLoginAt !== null) {
                expect(typeof user.lastLoginAt).toBe('string');
            }
        }
    });
});
