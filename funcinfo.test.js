'use strict';
function inline() {}
// eslint-disable-next-line node/no-unpublished-require
const { expect } = require('chai');
let funcinfo;
if (process.env.USE_ARTIFACT) {
  // eslint-disable-next-line node/no-missing-require
  ({ funcinfo } = require('./prebuilt/index'));
  console.log(
    `Running tests with prebuilt for ${process.platform} ${process.version}`
  );
} else {
  ({ funcinfo } = require('.'));
  console.log('Running with locally built module');
}

describe('funcinfo tests', function() {
  const mod1 = require('./test/resources/module1');
  const expectedPath = /module1\.js/;

  it('should get file and lineNumber for an arrow function', function() {
    const results = funcinfo(mod1.arrow);
    // line numbers start at 0 in v8
    expect(results.lineNumber).to.equal(3);
    expect(results.file).to.match(expectedPath);
    expect(results.method).to.equal('');
    expect(results.type).to.equal('Function');
  });

  it('should get file and lineNumber for a named function', function() {
    const results = funcinfo(mod1.named);
    // line numbers start at 0 in v8
    expect(results.lineNumber).to.equal(8);
    expect(results.file).to.match(expectedPath);
    expect(results.method).to.equal('named');
    expect(results.type).to.equal('Function');
  });

  it('should get file and lineNumber for an anonymous function', function() {
    const results = funcinfo(mod1.anon);
    // line numbers start at 0 in v8
    expect(results.lineNumber).to.equal(10);
    expect(results.file).to.match(expectedPath);
    expect(results.method).to.equal('');
    expect(results.type).to.equal('Function');
  });

  it('should return file and lineNumber for an inline function reference', function() {
    const results = funcinfo(inline);
    // line numbers start at 0 in v8
    expect(results.lineNumber).to.equal(1);
    const expectedPath = /funcinfo\.test\.js/;
    expect(results.file).to.match(expectedPath);
    expect(results.method).to.equal('inline');
    expect(results.type).to.equal('Function');
  });

  [
    { type: 'string', value: 'hi' },
    { type: 'int', value: 100 },
    { type: 'boolean', value: true },
    { type: 'array', value: [1, 2, 3] },
    { type: 'object', value: { unit: 'test' } }
  ].forEach(({ type, value }) => {
    it(`should return null for a ${type}`, function() {
      const results = funcinfo(value);
      expect(results).to.be.null;
    });
  });
});
