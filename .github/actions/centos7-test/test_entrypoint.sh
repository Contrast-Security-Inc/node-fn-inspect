#! /bin/bash -e

NODE_VERSION=$1

os_name=$(grep ^'ID=' /etc/os-release | cut -d= -f2 | sed 's/"//g')

if [ "$os_name" = "alpine" ]; then
  package_update='apk update'
  package_install='apk add'
  additional_packages='g++'
elif [ "$os_name" = "centos" ]; then
  # try to handle yum's helpfulness
  package_update='yum check-update -y'
  package_install='yum install -y'
  additional_packages='gcc-c++'
else # debian, ubuntu
  package_update='apt-get update -y'
  package_install='apt-get install -y'
  additional_packages='g++ software-properties-common build-essential'
fi

$package_update || [ $? -eq 100 ]
$package_install curl

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install $NODE_VERSION

$package_install \
  python3 \
  make \
  valgrind
$package_install $additional_packages

npm install --unsafe-perm

# test finally
npm test
npm run test:valgrind
