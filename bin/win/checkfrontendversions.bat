@echo off
echo.
echo ========================================
echo Checking frontend dependency versions
echo ========================================
echo.

call npx npm-check-updates

echo.
echo ========================================
echo Check completed
echo ========================================
pause
