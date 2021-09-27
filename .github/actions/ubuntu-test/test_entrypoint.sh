#! /bin/bash -e

NODE_VERSION=$1

[ -z "$NODE_VERSION" ] && echo "invalid version ${NODE_VERSION}" && exit 1

os_name=$(grep ^'ID=' /etc/os-release | cut -d= -f2 | sed 's/"//g')
echo "[installing node v${NODE_VERSION} for $os_name]"

if [ "$os_name" = "alpine" ]; then
  package_update='apk update'
  package_install='apk add'
  # needs g++ additional package (beyond make and python)
  # we don't really handle alpine now.
  exit 1
elif [ "$os_name" = "centos" ]; then
  # try to handle yum's helpfulness
  package_update='yum check-update -y'
  package_install='yum install -y'
  prefix='rpm'
else
  package_update='apt-get update -y'
  package_install='apt-get install -y'
  prefix='deb'
fi

$package_update || [ $? -eq 100 ]
$package_install curl

curl -fsSL https://${prefix}.nodesource.com/setup_${NODE_VERSION}.x | bash -
$package_install -y nodejs

if [ "$prefix" = "deb" ]; then
  DEBIAN_FRONTEND="noninteractive" apt-get -y install \
    python3 \
    make \
    build-essential \
    valgrind
elif [ "$prefix" = "rpm" ]; then
  yum install -y \
    make \
    gcc-c++ \
    valgrind
else
  echo "trying to build on something other than deb or rpm"
  exit 1
fi

npm_version=$(npm -v)
node_version=$(node -v)
echo "[node ${node_version} npm ${npm_version}]"

# get rid of npm@7 before it rewrites package-lock.json and messes things up
npm install -g npm@6
npm_version=$(npm -v)
echo "[using node ${node_version} npm ${npm_version}]"
npm install

# not sure what changed that this isn't part of the install, but it's not.
npx node-gyp configure
npx node-gyp build

npm test
npm run test:valgrind
