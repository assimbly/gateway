#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

property_file="../../gradle.properties"

if [ -z "$1" ]; then
    sed -i .bak "s/type=.*/type=FULL/" $property_file
    clear & ./../../gradlew clean bootJar --settings-file ./../../settings.gradle -Papi-docs
else
    if [ -z "$2" ]; then
        type="$1^^"
        sed -i .bak "s/type=.*/type=$type/" $property_file
        clear & ./../../gradlew clean bootJar --settings-file ./../../settings.gradle -Papi-docs -P$1
    else
        if [ -z "$3" ]; then
            type="$2^^"
            sed -i .bak "s/type=.*/type=$type/" $property_file
            clear & ./../../gradlew clean bootJar --settings-file ./../../settings.gradle -Papi-docs -P$1 -P$2
        else
            type="$3^^"
            sed -i .bak "s/type=.*/type=$type/" $property_file
            clear & ./../../gradlew clean bootJar --settings-file ./../../settings.gradle -Papi-docs -P$1 -P$2 -P$3
        fi
    fi
fi
