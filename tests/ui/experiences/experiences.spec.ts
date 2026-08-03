import { test } from '../../../helpers/auth-fixtures';
import { EXPERIENCES_TARGET as target } from '../../../helpers/catalog-targets';
import { uiScenarioGroups } from '../../../helpers/catalog-scenarios';

test.describe(target.name, { tag: ['@ui'] }, () => {
  for (const [group, scenarios] of uiScenarioGroups(target)) {
    test.describe(group, () => {
      for (const { name, tag, fn } of scenarios) test(name, { tag: [tag] }, fn);
    });
  }
});
