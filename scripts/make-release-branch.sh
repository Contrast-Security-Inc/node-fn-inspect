# exit on error
set -e
if [[ -z $1 || -z $2 ]]; then
  echo "Please specify a release type(e.g patch, minor or major) and branch name (e.g. NODE-1234)"
  exit 255
fi
PARENT_BRANCH=master
RELEASE_TYPE=$1
BRANCH_NAME=$2
BRANCH=release/$BRANCH_NAME-$RELEASE_TYPE
git fetch > /dev/null 2>&1
git checkout $PARENT_BRANCH
git pull origin $PARENT_BRANCH
git checkout -b $BRANCH
git push origin $BRANCH