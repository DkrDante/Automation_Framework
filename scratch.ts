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

    // Dump auth/verify-token, stats, and products[0] fully
    const endpoints: [string, string][] = [
        ['/api/auth/verify-token', 'full'],
        ['/api/stats', 'full'],
        ['/api/products', 'first'],
        ['/api/scenes', 'first-nested'],
    ];

    for (const [ep, mode] of endpoints) {
        const resp = await reqContext.get(ep);
        console.log(`\n=== ${ep} ===`);
        if (resp.status() === 200) {
            const body = await resp.json();
            if (mode === 'full') {
                console.log(JSON.stringify(body, null, 2));
            } else if (mode === 'first') {
                if (Array.isArray(body) && body.length > 0) {
                    console.log("KEYS:", Object.keys(body[0]));
                    console.log(JSON.stringify(body[0], null, 2));
                }
            } else if (mode === 'first-nested') {
                // e.g. { scenes: [...] }
                for (const [k, v] of Object.entries(body)) {
                    if (Array.isArray(v) && (v as any[]).length > 0) {
                        console.log(`${k}[0] KEYS:`, Object.keys((v as any[])[0]));
                        console.log(JSON.stringify((v as any[])[0], null, 2));
                    }
                }
            }
        }
    }
    await reqContext.dispose();
})();
