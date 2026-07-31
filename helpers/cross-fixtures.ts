import { test as apiTest } from './api-fixtures';
import path from 'node:path';

export const STORAGE_STATE_PATH =
  process.env.AUTH_STORAGE_STATE ?? path.resolve(__dirname, '../.auth/state.json');

export const test = apiTest.extend({
  storageState: STORAGE_STATE_PATH,
});

export { expect } from '@playwright/test';
