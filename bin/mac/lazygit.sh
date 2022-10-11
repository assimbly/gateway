#!/bin/bash

if [ -n "$1" ]; then
  git add -A
  git commit -m "$1"
  git push
else
    printf "\nUsage:\n"
    printf "\nlazygit.sh <Commit Message>\n"
fi
