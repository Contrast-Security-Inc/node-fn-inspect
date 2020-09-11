#!/bin/bash -e

unzip funcinfo.tgz.zip
tar zxvf funcinfo.tgz

if [[ -z $SEMVER_TYPE ]]; then
  echo "Could not parse semver type from GitHub ref: $HEAD"
  exit 255
fi

echo "Publishing module"
cd package
npm version "$SEMVER_TYPE"
npm publish
cd ..