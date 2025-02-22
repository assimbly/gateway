@echo off
setlocal enabledelayedexpansion

set "propertyFile=..\..\gradle.properties"
set "tempFile=temp.properties"
set "propertyName=type"
set "newValue=FULL"

if "%~1"=="" (
    goto UPDATE
)else if "%~1" == "integration" (
    set "newValue=INTEGRATION"
)else if "%~1" == "broker" (
     set "newValue=BROKER"
)else if "%~1" == "headless" (
     set "newValue=HEADLESS"
)

if "%~2"=="" (
    goto UPDATE
)else if "%~2" == "integration" (
    set "newValue=INTEGRATION"
)else if "%~2" == "broker" (
     set "newValue=BROKER"
)else if "%~2" == "headless" (
     set "newValue=HEADLESS"
)

if "%~3"=="" (
    goto UPDATE
)else if "%~3" == "integration" (
    set "newValue=INTEGRATION"
)else if "%~3" == "broker" (
     set "newValue=BROKER"
)else if "%~3" == "headless" (
     set "newValue=HEADLESS"
)

:UPDATE

if exist "%tempFile%" del "%tempFile%"

for /f "tokens=1* delims==" %%a in ('type "%propertyFile%"') do (
    set "line=%%a"
    if "!line!" == "%propertyName%" (
        echo %propertyName%=%newValue%>> "%tempFile%"
    ) else (
        echo %%a=%%b>> "%tempFile%"
    )
)

move /y "%tempFile%" "%propertyFile%"

set JAVA_HOME=D:\test\JDKS3\graalvm-jdk-21.0.3+7.1

if [%1]==[] (
    cls & ..\..\gradlew clean bootJar --settings-file ./../../settings.gradle -Papi-docs
) else (
    if [%2]==[] (
        cls & ..\..\gradlew clean bootJar "-Dorg.gradle.jvmargs=-Xmx3g" --settings-file ./../../settings.gradle -Papi-docs -P%1
    ) else (
        if [%3]==[] (
            cls & ..\..\gradlew clean bootJar "-Dorg.gradle.jvmargs=-Xmx3g" --settings-file ./../../settings.gradle -Papi-docs -P%1 -P%2
        ) else (
            cls & ..\..\gradlew clean bootJar "-Dorg.gradle.jvmargs=-Xmx3g" --settings-file ./../../settings.gradle -Papi-docs -P%1 -P%2 -P%3
        )
    )
)

echo "Release (jar file) is located at gateway/build/libs"
