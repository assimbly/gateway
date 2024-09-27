#!/bin/bash

if [ -z "$1" ]; then
  echo "usage"
  echo ""
  echo "update version to <versionnumber>"
  echo ""
  echo "example:"
  echo "updateversion 1.0.0"
  exit 1
fi

echo ""
echo "update version to $1"
echo ""
../../gradlew -q version -PnewVersion="$1" --settings-file ./../../settings.gradle