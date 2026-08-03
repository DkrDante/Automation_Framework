import { test, expect } from '@playwright/test';

const origin = new URL(process.env.DEV_BASE_URL ?? 'https://dev.devsatorixr.com/login').origin;

test.describe('Manifest', { tag: ['@api', '@regression'] }, () => {
  test('GET /manifest.json', async ({ request }) => {
    const response = await request.get(`${origin}/manifest.json`);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      name: 'SatoriXR',
      short_name: 'SatoriXR',
      description: 'Your AR Experience Platform',
      icons: [
        { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
      start_url: '/',
      display: 'standalone',
      scope: '/',
      theme_color: '#0f172a',
      background_color: '#ffffff',
    });
  });
});
