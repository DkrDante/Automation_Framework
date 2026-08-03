import { test } from '../../../helpers/cross-fixtures';
import { EXPERIENCES_TARGET as target } from '../../../helpers/catalog-targets';
import { filterScenarios } from '../../../helpers/catalog-scenarios';

test.describe(`${target.name} category filter vs API`, { tag: ['@consistency', '@regression'] }, () => {
  for (const { name, fn } of filterScenarios(target)) test(name, fn);
});
