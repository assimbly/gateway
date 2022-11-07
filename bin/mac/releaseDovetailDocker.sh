@echo off

#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

clear & ./../../gradlew clean bootJar jib -Djib.to.credHelper=ecr-login -Djib.to.image=/assimbly:snapshot --settings-file ./../../settings.gradle  -Papi-docs -Pprod -Pheadless -Pdovetail

