import { test } from '../../../helpers/cross-fixtures';
import { PRODUCTS_TARGET as target } from '../../../helpers/catalog-targets';
import { sortScenarios } from '../../../helpers/catalog-scenarios';

test.describe(`${target.name} sort vs API`, { tag: ['@consistency', '@regression'] }, () => {
  for (const { name, fn } of sortScenarios(target)) test(name, fn);
});
