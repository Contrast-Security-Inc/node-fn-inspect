#! /bin/bash -e

NODE_VERSION=$1
curl -sL https://rpm.nodesource.com/setup_$NODE_VERSION.x | bash -

yum install -y python3
yum install -y nodejs make gcc-c++ valgrind

npm install --unsafe-perm
chmod +x test/code-events.test.js
chmod +x test/funcinfo.test.js
npm run test:valgrind
