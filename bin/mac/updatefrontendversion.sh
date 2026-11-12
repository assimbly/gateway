#!/bin/bash

TARGET="${1:-patch}"

case "$TARGET" in
  patch)
    NCU_ARGS="-u --target patch"
    DESC="patch"
    ;;
  minor)
    NCU_ARGS="-u --target minor"
    DESC="minor (patch + minor)"
    ;;
  major)
    NCU_ARGS="-u --target latest --configFilePath . --configFileName .ncurc.major.cjs"
    DESC="major"
    ;;
  all)
    NCU_ARGS="-u --target latest"
    DESC="all (patch + minor + major)"
    ;;
  *)
    echo
    echo "Invalid parameter: $TARGET"
    echo "Valid parameters: patch, minor, major, all"
    exit 1
    ;;
esac

echo
echo "========================================"
echo "Updating frontend dependency versions ($DESC)"
echo "========================================"
echo

if [ "$TARGET" = "major" ]; then
  echo "module.exports = { filterResults: (name, { currentVersionSemver, upgradedVersionSemver }) => parseInt(currentVersionSemver[0]?.major, 10) < parseInt(upgradedVersionSemver?.major, 10) };" > .ncurc.major.cjs
fi

npx npm-check-updates $NCU_ARGS

if [ -f .ncurc.major.cjs ]; then
  rm -f .ncurc.major.cjs
fi

echo
echo "========================================"
echo "Update completed"
echo "========================================"

read -p "Press Enter to continue..."
