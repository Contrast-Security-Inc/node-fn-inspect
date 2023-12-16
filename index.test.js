// @ts-check
'use strict';

const { expect } = require('chai');
const { funcInfo } = require('.');

describe('funcInfo', function () {
  const mod = require('./test/resources/module');
  const expectedPath = require.resolve('./test/resources/module.js');

  it('returns the correct info for an arrow function', function () {
    const results = funcInfo(mod.arrow);

    expect(results).to.deep.equal({
      column: 16,
      file: expectedPath,
      lineNumber: 3, // line numbers start at 0 in v8
      method: '',
      type: 'Function',
    });
  });

  it('returns the correct info for a named function', function () {
    const results = funcInfo(mod.named);

    expect(results).to.deep.equal({
      column: 30,
      file: expectedPath,
      lineNumber: 8, // line numbers start at 0 in v8
      method: 'named',
      type: 'Function',
    });
  });

  it('returns the correct info for an anonymous function', function () {
    const results = funcInfo(mod.anon);

    expect(results).to.deep.equal({
      column: 23,
      file: expectedPath,
      lineNumber: 10, // line numbers start at 0 in v8
      method: '',
      type: 'Function',
    });
  });

  it('returns the correct info for an inline function', function () {
    function inline() {}

    const results = funcInfo(inline);
    expect(results).to.deep.equal({
      column: 19,
      file: __filename,
      lineNumber: 47, // line numbers start at 0 in v8
      method: 'inline',
      type: 'Function',
    });
  });

  it('returns the correct info for an async inline function', function () {
    async function inlineAsync() {}

    const results = funcInfo(inlineAsync);
    expect(results).to.deep.equal({
      column: 30,
      file: __filename,
      lineNumber: 60, // line numbers start at 0 in v8
      method: 'inlineAsync',
      type: 'AsyncFunction',
    });
  });

  describe('non-function args', function () {
    ['hi', 100, true, [1, 2, 3], { unit: 'test' }].forEach((value) => {
      it(`returns null when passed a ${value.constructor.name}`, function () {
        // @ts-expect-error these arguments are not functions
        const results = funcInfo(value);
        expect(results).to.equal(null);
      });
    });
    [undefined, null, ''].forEach((value) => {
      it(`returns null when passed ${value}`, function () {
        // @ts-expect-error these arguments are not functions
        const results = funcInfo(value);
        expect(results).to.equal(null);
      });
    });
  });
});
