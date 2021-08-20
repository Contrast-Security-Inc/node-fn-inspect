#!/usr/bin/env bash
set -e

if [[ -z $1 ]]; then
  echo "Please specify semver type"
  exit 255
fi

SEMVER_TYPE=$1

#Clear any old funcinfo files
rm -rf funcinfo
rm -rf funcinfo.tgz

unzip funcinfo.tgz.zip
mkdir funcinfo
tar -xzvf funcinfo.tgz -C funcinfo

echo "Publishing module"
npm version $SEMVER_TYPE --prefix funcinfo/package
npm publish funcinfo/package
