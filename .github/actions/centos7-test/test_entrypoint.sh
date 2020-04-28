#! /bin/bash -e

NODE_VERSION=$1
curl -sL https://rpm.nodesource.com/setup_$NODE_VERSION.x | bash -

yum install -y nodejs make gcc-c++

npm install --unsafe-perm
npm run test
