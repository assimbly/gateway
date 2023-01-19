@echo off

if [%1]==[] goto usage
echo:
@echo update version to %1
echo:
cls & ..\..\gradlew -q version -PnewVersion=%1 --settings-file ./../../settings.gradle
:usage
echo:
@echo updateversion ^<versionnumber^>
echo:
@echo example:
@echo updateversion 1.0.0
exit /B 1u
