# @contrast/fn-inspect

This module uses some v8 function APIs to obtain the file and line number of a function reference.  It will also return the constructor's name and function name.

## Installation
`npm install @contrast/fn-inspect`

## Usage

```javascript
  const funcInfo = require('@contrast/fn-inspect');

  function testFunction() {}

  const results = funcInfo(testFunction);

  // Returns an object with the following data
  // { lineNumber: 2, file: 'example.js', method: 'testFunction', type: 'Function' }
```

## Build locally
` npm install`

## Test
` npm test`

## License
Copyright 2020-present OpenJS Foundation and contributors. Licensed [MIT](https://github.com/Contrast-Security-Inc/node-fn-inspect/blob/master/LICENSE).
