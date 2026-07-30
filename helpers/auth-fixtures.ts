import { test as base, expect } from '@playwright/test';
import path from 'node:path';

export const STORAGE_STATE_PATH =
  process.env.AUTH_STORAGE_STATE ?? path.resolve(__dirname, '../.auth/state.json');

// Don't import this in the login spec — it needs an unauthenticated context.
export const test = base.extend({
  storageState: STORAGE_STATE_PATH,
});

export { expect };
