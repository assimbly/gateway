@echo off

#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

clear & ./../../gradlew clean bootJar jib -Djib.to.credHelper=ecr-login -Djib.to.image=aws_account_id.dkr.ecr.region.amazonaws.com/assimbly:snapshot --settings-file ./../../settings.gradle  -Papi-docs -Pprod -Pheadless -Pdovetail

