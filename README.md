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

Simply run `npm version` and `git push && git push --tags`. The `release` workflow runs when
a tag of the form `v1.2.3` is pushed.

## Temporary code

Node version 22.5.0 ships with a very broken `npm`. This hardcodes version 22.5.1 until
github actions stops defaulting to 22.5.0 when node version 22 is specified.
