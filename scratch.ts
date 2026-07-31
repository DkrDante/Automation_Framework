import { request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

(async () => {
    const origin = 'https://try.satorixr.com';
    const statePath = path.resolve(__dirname, './.auth/state.json');
    
    let extraHTTPHeaders = {};
    if (fs.existsSync(statePath)) {
        const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
        const originData = state.origins?.find((o: any) => o.origin === origin);
        const tokenObj = originData?.localStorage?.find((item: any) => item.name === 'auth_token');
        if (tokenObj) {
            extraHTTPHeaders = { Authorization: `Bearer ${tokenObj.value}` };
        }
    }

    const reqContext = await request.newContext({ 
        baseURL: origin,
        storageState: statePath,
        extraHTTPHeaders
    });

    const endpoints = [
        '/api/settings',
        '/api/categories',
        '/api/users',
        '/api/new-analytics/portfolio',
        '/api/new-analytics/filter-options'
    ];

    for (const ep of endpoints) {
        const resp = await reqContext.get(ep);
        console.log(`\n\n--- ${ep} ---`);
        if (resp.status() === 200) {
            const body = await resp.json();
            // Just print a sample or schema structure
            if (Array.isArray(body) && body.length > 0) {
                console.log("Array, item [0]:", JSON.stringify(body[0], null, 2).substring(0, 500));
            } else if (body && typeof body === 'object') {
                if (body.data && Array.isArray(body.data) && body.data.length > 0) {
                     console.log("Object with data array, item [0]:", JSON.stringify(body.data[0], null, 2).substring(0, 500));
                } else {
                     console.log("Object:", JSON.stringify(body, null, 2).substring(0, 500));
                }
            } else {
                console.log(body);
            }
        } else {
            console.log(`Status: ${resp.status()} - ${await resp.text()}`);
        }
    }
})();
