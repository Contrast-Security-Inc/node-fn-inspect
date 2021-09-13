#! /bin/bash -e

NODE_VERSION=$1
apt-get update
apt-get -y install curl
curl -sL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash -

apt -y install nodejs 
DEBIAN_FRONTEND="noninteractive" apt-get -y install python3 make build-essential valgrind

npm install --unsafe-perm
npm run test:valgrind
