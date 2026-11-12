@echo off
setlocal

set "TARGET=%~1"
if "%TARGET%"=="" set "TARGET=patch"

if /I "%TARGET%"=="patch" (
    set "NCU_ARGS=-u --target patch"
    set "DESC=patch"
) else if /I "%TARGET%"=="minor" (
    set "NCU_ARGS=-u --target minor"
    set "DESC=minor (patch + minor)"
) else if /I "%TARGET%"=="major" (
    set "NCU_ARGS=-u --target latest --configFilePath . --configFileName .ncurc.major.cjs"
    set "DESC=major"
) else if /I "%TARGET%"=="all" (
    set "NCU_ARGS=-u --target latest"
    set "DESC=all (patch + minor + major)"
) else (
    echo.
    echo Invalid parameter: %TARGET%
    echo Valid parameters: patch, minor, major, all
    exit /B 1
)

echo.
echo ========================================
echo Updating frontend dependency versions (%DESC%)
echo ========================================
echo.

if /I "%TARGET%"=="major" (
    echo module.exports = { filterResults: ^(name, { currentVersionSemver, upgradedVersionSemver }^) =^> parseInt^(currentVersionSemver[0]?.major, 10^) ^< parseInt^(upgradedVersionSemver?.major, 10^) }; > .ncurc.major.cjs
)

call npx npm-check-updates %NCU_ARGS%

if exist .ncurc.major.cjs del .ncurc.major.cjs

echo.
echo ========================================
echo Update completed
echo ========================================
pause
