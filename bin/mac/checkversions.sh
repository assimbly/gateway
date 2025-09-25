#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"
clear & ./../../gradlew --project-dir ./../../ dependencyUpdates
