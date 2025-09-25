@echo off

if [%1]==[] (
    cls & ..\..\gradlew clean bootJar  "-Dorg.gradle.jvmargs=-Xmx4g" jibDockerBuild --project-dir ./../../ -Papi-docs
) else (
    if [%2]==[] (
       cls & ..\..\gradlew clean bootJar  "-Dorg.gradle.jvmargs=-Xmx4g" jibDockerBuild -Djib.to.image=assimbly/gateway-%1 --project-dir ./../../ -Papi-docs -P%1
    ) else (
        if [%3]==[] (
           cls & ..\..\gradlew clean bootJar  "-Dorg.gradle.jvmargs=-Xmx4g" jibDockerBuild -Djib.to.image=assimbly/gateway-%1 --project-dir ./../../ -Papi-docs -P%1 -P%2
        ) else (
            if [%4]==[] (
                cls & ..\..\gradlew clean bootJar  "-Dorg.gradle.jvmargs=-Xmx4g" jibDockerBuild -Djib.to.image=assimbly/gateway-%1 --project-dir ./../../ -Papi-docs -P%1 -P%2 -P%3
            ) else (
                cls & ..\..\gradlew clean bootJar  "-Dorg.gradle.jvmargs=-Xmx4g" jibDockerBuild -Djib.to.image=assimbly/gateway-%1:%4 --project-dir ./../../ -Papi-docs -P%1 -P%2 -P%3
            )
        )
    )
)
