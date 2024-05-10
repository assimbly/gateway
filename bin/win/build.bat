@echo off

if [%1]==[] (
    cls & ..\..\gradlew clean bootJar --settings-file ./../../settings.gradle -Papi-docs
) else (
    if [%2]==[] (
        cls & ..\..\gradlew clean bootJar --settings-file ./../../settings.gradle -Papi-docs -P%1
    ) else (
        if [%3]==[] (
            cls & ..\..\gradlew clean bootJar --settings-file ./../../settings.gradle -Papi-docs -P%1 -P%2
        ) else (
            cls & ..\..\gradlew clean bootJar --settings-file ./../../settings.gradle -Papi-docs -P%1 -P%2 -P%3
        )
    )
)

echo "Release (jar file) is located at gateway/build/libs"
