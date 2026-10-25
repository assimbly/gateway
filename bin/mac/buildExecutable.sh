#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

property_file="../../gradle.properties"
target_task="packageMac"

if [ "$1" = "win" ]; then
    target_task="packageWin"
    shift
elif [ "$1" = "mac" ]; then
    target_task="packageMac"
    shift
elif [ "$1" = "all" ]; then
    target_task="packageAll"
    shift
fi

if [ -z "$1" ]; then
    sed -i .bak "s/type=.*/type=FULL/" $property_file
    clear & ./../../gradlew clean $target_task --project-dir ./../../ -Pprod -Papi-docs
else
    type=$(echo "$1" | tr '[:lower:]' '[:upper:]')
    sed -i .bak "s/type=.*/type=$type/" $property_file
    if [ -z "$2" ]; then
        clear & ./../../gradlew clean $target_task --project-dir ./../../ -Pprod -Papi-docs -P$1
    else
        clear & ./../../gradlew clean $target_task --project-dir ./../../ -Pprod -Papi-docs -P$1 -P$2
    fi
fi

echo "Executable bundle(s) are located at gateway/build/distributions"
