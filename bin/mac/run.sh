#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

if [ -z "$1" ]; then
    clear & ./../../gradlew --settings-file ./../../settings.gradle
else
    if [ -z "$2" ]; then
        clear & ./../../gradlew --settings-file ./../../settings.gradle -P$1
    else
        if [ -z "$3" ]; then
            clear & ./../../gradlew --settings-file ./../../settings.gradle -P$1  -P$2
        else
            clear & ./../../gradlew --settings-file ./../../settings.gradle -P$1 -P$2 -P$3
        fi
    fi
fi
