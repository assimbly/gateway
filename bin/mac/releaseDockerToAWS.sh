#!/bin/bash

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

property_file="../../gradle.properties"

sed -i .bak "s/type=.*/type=HEADLESS/" $property_file
clear & ./../../gradlew clean bootJar jib -Djib.to.credHelper=ecr-login -Djib.to.image=902987087860.dkr.ecr.eu-west-1.amazonaws.com/gateway-headless:next --settings-file ./../../settings.gradle -Papi-docs -Pprod -Pfull -Pheadless

sed -i .bak "s/type=.*/type=BROKER/" $property_file
clear & ./../../gradlew clean bootJar jib -Djib.to.credHelper=ecr-login -Djib.to.image=902987087860.dkr.ecr.eu-west-1.amazonaws.com/gateway-broker:next --settings-file ./../../settings.gradle -Papi-docs -Pprod -Pbroker

