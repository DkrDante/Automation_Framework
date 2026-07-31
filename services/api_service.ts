import { APIRequestContext, test } from '@playwright/test';

export class APIError extends Error {
    constructor(public endpoint: string, public status: number, public expected: number = 200) {
        super(`API ${endpoint} returned status ${status} (expected ${expected})`);
        this.name = 'APIError';
    }
}

export class DashboardAPIService {
    constructor(private request: APIRequestContext) {}

    private async _get(endpoint: string): Promise<any> {
        const response = await this.request.get(endpoint);
        if (response.status() !== 200) {
            throw new APIError(endpoint, response.status());
        }
        return await response.json();
    }

    async verifyToken(): Promise<any> {
        return test.step('API — verify auth token', async () => {
            return this._get('/api/auth/verify-token');
        });
    }

    async getStats(): Promise<any> {
        return test.step('API — fetch dashboard stats', async () => {
            return this._get('/api/stats');
        });
    }

    async getProducts(): Promise<any[]> {
        return test.step('API — fetch products list', async () => {
            return this._get('/api/products');
        });
    }

    async getActiveProductsCount(): Promise<number> {
        return test.step('API — count active (non-archived) products', async () => {
            const products = await this.getProducts();
            return products.filter((p: any) => p.status !== 'archived').length;
        });
    }

    async getScenes(): Promise<any> {
        return test.step('API — fetch scenes list', async () => {
            return this._get('/api/scenes');
        });
    }

    async getSettings(): Promise<any> {
        return test.step('API — fetch settings', async () => {
            return this._get('/api/settings');
        });
    }

    async getCategories(): Promise<any> {
        return test.step('API — fetch categories', async () => {
            return this._get('/api/categories');
        });
    }

    async getUsers(): Promise<any> {
        return test.step('API — fetch users', async () => {
            return this._get('/api/users');
        });
    }

    async getAnalyticsPortfolio(): Promise<any> {
        return test.step('API — fetch analytics portfolio', async () => {
            return this._get('/api/new-analytics/portfolio');
        });
    }

    async getAnalyticsFilters(): Promise<any> {
        return test.step('API — fetch analytics filters', async () => {
            return this._get('/api/new-analytics/filter-options');
        });
    }
}
