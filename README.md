# @contrast/fn-inspect
[![codecov](https://codecov.io/gh/Contrast-Security-Inc/node-fn-inspect/branch/main/graph/badge.svg)](https://codecov.io/gh/Contrast-Security-Inc/node-fn-inspect)
![Pipeline Status](https://github.com/Contrast-Security-Inc/node-fn-inspect/workflows/Unit%20Tests%20and%20Build/badge.svg)

This module exposes some useful information from the underlying v8 engine.  Including:

* file and line number given a function reference
* code events (i.e. LAZY_COMPILE)

## Installation
`npm install @contrast/fn-inspect`

## Usage

Getting details about a function:

```javascript
  const { funcInfo } = require('@contrast/fn-inspect');

  function testFunction() {}

  const results = funcInfo(testFunction);

  // Returns an object with the following data
  // { lineNumber: 2, file: 'example.js', method: 'testFunction', type: 'Function' }
```

Registering a listener for code events:

```javascript
  const { setCodeEventListener } = require('@contrast/fn-inspect');

  setCodeEventListener(function(event) {
    console.log(event);
  });
```

## Build locally
` npm install`

## Test
` npm test`

## Publishing New Versions to @contrast/fn-inspect
1. Trigger a Build Artifact workflow by merging or pushing to develop.
2. If you don't have one, [create a Github personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token), be sure to enable SSO, and set an environment variable, `AUTH_TOKEN`, to it
3. Run `npm run release`

## License
Copyright 2020-present OpenJS Foundation and contributors. Licensed [MIT](https://github.com/Contrast-Security-Inc/node-fn-inspect/blob/main/LICENSE).
