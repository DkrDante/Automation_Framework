import { test, expect } from '../../../helpers/api-fixtures';

let usersResponse: any;

test.beforeAll(async ({ dashboardApi }) => {
    usersResponse = await dashboardApi.getUsers();
});

test.describe('Users API Exhaustive', { tag: ['@api', '@regression'] }, () => {
    test('users_response_is_valid', () => {
        expect(usersResponse.success).toBe(true);
        expect(Array.isArray(usersResponse.users)).toBe(true);
        expect(usersResponse.users.length).toBeGreaterThan(0);
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

    test('every_user_has_valid_access_type', () => {
        const validAccessTypes = ['Creator', 'Viewer', 'EndUser'];
        for (const user of usersResponse.users) {
            expect(validAccessTypes).toContain(user.accessType);
        }
    });

    test('every_user_has_valid_role', () => {
        const validRoles = ['Admin', 'Member'];
        for (const user of usersResponse.users) {
            expect(validRoles).toContain(user.role);
        }
    });

    test('every_user_email_is_unique', () => {
        const emails = usersResponse.users.map((u: any) => u.email);
        expect(new Set(emails).size).toBe(emails.length);
    });

    test('every_user_lastLoginAt_is_valid_iso8601_or_null', () => {
        for (const user of usersResponse.users) {
            if (user.lastLoginAt !== null) {
                const parsed = new Date(user.lastLoginAt);
                expect(parsed.toString()).not.toBe('Invalid Date');
            }
        }
    });

    test('boolean_flag_pairs_are_consistent', () => {
        for (const user of usersResponse.users) {
            // isProtected and protected should always match
            expect(user.isProtected).toBe(user.protected);
            // isSystem and system should always match
            expect(user.isSystem).toBe(user.system);
        }
    });
});
