#!/usr/bin/env bash -e

if [[ -z $1 || -z $2 ]]; then
  echo "Please specify semver type and directory containing funcinfo.tgz.zip"
  exit 255
fi

SEMVER_TYPE=$1
FUNCINFO_PATH=$2

#Clear any old funcinfo files
rm -rf $FUNCINFO_PATH/funcinfo
rm -rf $FUNCINFO_PATH/funcinfo.tgz

unzip $FUNCINFO_PATH/funcinfo.tgz.zip -d $FUNCINFO_PATH
mkdir $FUNCINFO_PATH/funcinfo
tar -xzvf $FUNCINFO_PATH/funcinfo.tgz -C $FUNCINFO_PATH/funcinfo

echo "Publishing module"
npm version $SEMVER_TYPE --prefix $FUNCINFO_PATH/funcinfo/package
npm publish $FUNCINFO_PATH/funcinfo/package