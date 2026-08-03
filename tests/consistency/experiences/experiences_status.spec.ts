import { test } from '../../../helpers/cross-fixtures';
import { EXPERIENCES_TARGET as target } from '../../../helpers/catalog-targets';
import { statusScenarios } from '../../../helpers/catalog-scenarios';

test.describe(`${target.name} status filter vs API`, { tag: ['@consistency', '@regression'] }, () => {
  for (const { name, fn } of statusScenarios(target)) test(name, fn);
});
