#!/usr/bin/env bash

# Change to the script's directory
cd "$(dirname "$0")"

echo "==> Cleaning previous Allure results/report"
rm -rf allure-results allure-report

echo "==> Running Playwright tests"
npm test
TEST_EXIT_CODE=$?

echo "==> Generating and opening Allure report"
npx allure awesome ./allure-results -o allure-report
npx allure open ./allure-report

exit $TEST_EXIT_CODE
