#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

property_file="../../gradle.properties"

if [ -z "$1" ]; then
    sed -i .bak "s/type=.*/type=FULL/" $property_file
    clear & ./../../gradlew clean bootJar jibDockerBuild --settings-file ./../../settings.gradle -Papi-docs
else
    if [ -z "$2" ]; then
        sed -i .bak "s/type=.*/type=$1/" $property_file
        clear & ./../../gradlew clean bootJar jibDockerBuild -Djib.to.image=assimbly/gateway-$1 --settings-file ./../../settings.gradle  -Papi-docs -P$1
    else
        if [ -z "$3" ]; then
            sed -i .bak "s/type=.*/type=$2/" $property_file
            clear & ./../../gradlew clean bootJar jibDockerBuild -Djib.to.image=assimbly/gateway-$1 --settings-file ./../../settings.gradle  -Papi-docs -P$1 -P$2
        else
            if [ -z "$4" ]; then
                sed -i .bak "s/type=.*/type=$3/" $property_file
                clear & ./../../gradlew clean bootJar jibDockerBuild -Djib.to.image=assimbly/gateway-$1 --settings-file ./../../settings.gradle  -Papi-docs -P$1 -P$2
            else
                sed -i .bak "s/type=.*/type=$4/" $property_file
                clear & ./../../gradlew clean bootJar jibDockerBuild -Djib.to.image=assimbly/gateway-$1:$4 --settings-file ./../../settings.gradle  -Papi-docs -P$1 -P$2 -P$3
            fi
        fi
    fi
fi
