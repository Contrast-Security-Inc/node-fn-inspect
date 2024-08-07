#!/bin/sh

#
# this script is invoked by each docker container that builds linux-based
# native modules. it gets a single argument - the name of the Dockerfile
# context directory which is the target platform.

#
# responsibilities of the script:
# - invoke prebuildify with the correct arguments for the target
target=$1

common="-t 16.9.1 -t 18.7.0 -t 20.5.0 -t 22.2.0 --strip --napi false"

# this is useful for debugging.
npm ls

case $target in
    centos7 | alpine)
        echo "Building for $target"
        # shellcheck disable=SC2086 # $common is multiple arguments
        npx prebuildify $common --tag-libc
    ;;

    linux-arm64)
        echo "Building for $target"
        # shellcheck disable=SC2086 # $common is multiple arguments
        npx prebuildify $common --tag-armv
    ;;

    *)
        echo "Unknown target: $target"
        exit 1
    ;;

esac
