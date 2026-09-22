#!/bin/bash

echo
echo "========================================"
echo "Checking frontend dependency versions"
echo "========================================"
echo

npx npm-check-updates

echo
echo "========================================"
echo "Check completed"
echo "========================================"

read -p "Press Enter to continue..."
