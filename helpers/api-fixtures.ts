import { test as base, expect, request as pwRequest } from '@playwright/test';
import { DashboardAPIService } from '../services/api_service';
import fs from 'fs';
import path from 'path';

export const STORAGE_STATE_PATH = process.env.AUTH_STORAGE_STATE ?? path.resolve(__dirname, '../.auth/state.json');

export const test = base.extend<{}, { dashboardApi: DashboardAPIService }>({
    dashboardApi: [async ({ playwright }, use, workerInfo) => {
        const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
        
        let extraHTTPHeaders = {};
        if (fs.existsSync(STORAGE_STATE_PATH)) {
            const state = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'));
            const originData = state.origins?.find((o: any) => o.origin === origin);
            const tokenObj = originData?.localStorage?.find((item: any) => item.name === 'auth_token');
            if (tokenObj) {
                extraHTTPHeaders = { Authorization: `Bearer ${tokenObj.value}` };
            }
        }

        const reqContext = await pwRequest.newContext({
            baseURL: origin,
            storageState: fs.existsSync(STORAGE_STATE_PATH) ? STORAGE_STATE_PATH : undefined,
            extraHTTPHeaders
        });

        const dashboardApi = new DashboardAPIService(reqContext);
        await use(dashboardApi);
        await reqContext.dispose();
    }, { scope: 'worker' }],
});

export { expect };
