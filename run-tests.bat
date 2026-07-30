@echo off
setlocal

cd /d "%~dp0"

echo ==^> Cleaning previous Allure results/report
if exist allure-results rmdir /s /q allure-results
if exist allure-report rmdir /s /q allure-report

echo ==^> Running Playwright tests
call npm test
set TEST_EXIT_CODE=%ERRORLEVEL%

echo ==^> Generating and opening Allure report
call npx allure generate --open

exit /b %TEST_EXIT_CODE%
