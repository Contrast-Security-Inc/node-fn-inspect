# @contrast/fn-inspect

[![Test](https://github.com/Contrast-Security-Inc/node-fn-inspect/actions/workflows/test.yml/badge.svg)](https://github.com/Contrast-Security-Inc/node-fn-inspect/actions/workflows/test.yml)

This module exposes some useful information about functions from the v8 engine,
including:

- file and line number given a function reference

## Usage

Getting details about a function:

```js
const { funcInfo } = require('@contrast/fn-inspect');

function testFn() {}

const results = funcInfo(testFn);
// => { lineNumber: 2, column: 15, file: 'example.js', method: 'testFn', type: 'Function' }
```

## Building locally

`npm run build` will build the project for your current OS and architecture.

`npm run download` will pull the most recent build artifacts from GitHub.

## Publishing

Simply run `npm version` and `git push && git push --tags`. CI will take care of
releasing.

## Temporary note

```
bruce:~/.../csi/fn-inspect$ npm uninstall prebuildify-cross

removed 226 packages, and audited 425 packages in 784ms

89 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```
