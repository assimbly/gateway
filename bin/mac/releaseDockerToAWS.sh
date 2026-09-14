#!/bin/bash

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

property_file="../../gradle.properties"

# backend
sed -i .bak "s/type=.*/type=HEADLESS/" $property_file
# arm
clear & ./../../gradlew clean bootJar jib \
    -Djib.to.credHelper=ecr-login -Djib.to.image=902987087860.dkr.ecr.eu-west-1.amazonaws.com/backend-arm:next \
    -Djib.from.platforms=linux/arm64 \
    --project-dir ./../../ \
    -Papi-docs -Pprod -Pfull -Pheadless
# x86
clear & ./../../gradlew clean bootJar jib \
    -Djib.to.credHelper=ecr-login -Djib.to.image=902987087860.dkr.ecr.eu-west-1.amazonaws.com/backend:next \
    -Djib.from.platforms=linux/amd64 \
    --project-dir ./../../ \
    -Papi-docs -Pprod -Pfull -Pheadless

# broker
sed -i .bak "s/type=.*/type=BROKER/" $property_file
# arm
clear & ./../../gradlew clean bootJar jib \
    -Djib.to.credHelper=ecr-login -Djib.to.image=902987087860.dkr.ecr.eu-west-1.amazonaws.com/broker-arm:next \
    -Djib.from.platforms=linux/arm64 \
    --project-dir ./../../ \
    -Papi-docs -Pprod -Pbroker
# x86
clear & ./../../gradlew clean bootJar jib \
    -Djib.to.credHelper=ecr-login -Djib.to.image=902987087860.dkr.ecr.eu-west-1.amazonaws.com/broker:next \
    -Djib.from.platforms=linux/amd64 \
    --project-dir ./../../ \
    -Papi-docs -Pprod -Pbroker

