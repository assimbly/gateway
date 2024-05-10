@echo off

if [%1]==[] (
    cls & ..\..\gradlew --settings-file ./../../settings.gradle
) else (
    if [%2]==[] (
        cls & ..\..\gradlew --settings-file ./../../settings.gradle -P%1
    ) else (
        if [%3]==[] (
            cls & ..\..\gradlew --settings-file ./../../settings.gradle -P%1 -P%2
        ) else (
            cls & ..\..\gradlew --settings-file ./../../settings.gradle -P%1 -P%2 -P%3
        )
    )
)
