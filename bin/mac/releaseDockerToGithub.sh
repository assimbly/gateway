#!/bin/bash
set -euo pipefail

GITHUB_USER=$(gh api user --jq .login)
GITHUB_TOKEN=$(gh auth token)

build_and_push() {
  local image=$1
  local profile=$2

  clear && ./../../gradlew clean bootJar jib \
      -Djib.to.image="ghcr.io/assimbly/${image}:next-app" \
      -Djib.from.platforms=linux/amd64,linux/arm64 \
      -Djib.container.format=Docker \
      -Djib.to.auth.username="$GITHUB_USER" \
      -Djib.to.auth.password="$GITHUB_TOKEN" \
      --project-dir ./../../ \
      -Papi-docs -Pprod -Pfull "-P${profile}"
}

build_and_push assimbly-runtime headless
build_and_push assimbly-broker  broker
