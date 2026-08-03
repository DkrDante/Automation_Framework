import { test as teardown } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const STORAGE_STATE_PATH =
  process.env.AUTH_STORAGE_STATE ?? path.resolve(__dirname, '../../../.auth/state.json');

teardown('delete the saved login session', async () => {
  await fs.promises.rm(STORAGE_STATE_PATH, { force: true });
});
