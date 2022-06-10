// @ts-check
'use strict';

const { expect } = require('chai');
const { funcInfo, setCodeEventListener, stopListening } = require('.');

describe('fn-inspect', function () {
  describe('funcInfo', function () {
    const mod = require('./test/resources/module');
    const expectedPath = require.resolve('./test/resources/module.js');

    it('returns the correct info for an arrow function', function () {
      const results = funcInfo(mod.arrow);

      expect(results).to.deep.equal({
        file: expectedPath,
        lineNumber: 3, // line numbers start at 0 in v8
        method: '',
        type: 'Function',
      });
    });

    it('returns the correct info for a named function', function () {
      const results = funcInfo(mod.named);

      expect(results).to.deep.equal({
        file: expectedPath,
        lineNumber: 8, // line numbers start at 0 in v8
        method: 'named',
        type: 'Function',
      });
    });

    it('returns the correct info for an anonymous function', function () {
      const results = funcInfo(mod.anon);

      expect(results).to.deep.equal({
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
        file: __filename,
        lineNumber: 45, // line numbers start at 0 in v8
        method: 'inline',
        type: 'Function',
      });
    });

    it('returns the correct info for an async inline function', function () {
      async function inlineAsync() {}

      const results = funcInfo(inlineAsync);
      expect(results).to.deep.equal({
        file: __filename,
        lineNumber: 57, // line numbers start at 0 in v8
        method: 'inlineAsync',
        type: 'AsyncFunction',
      });
    });


    [
      { type: 'string', value: 'hi' },
      { type: 'int', value: 100 },
      { type: 'boolean', value: true },
      { type: 'array', value: [1, 2, 3] },
      { type: 'object', value: { unit: 'test' } },
    ].forEach(({ type, value }) => {
      it(`returns null for a ${type}`, function () {
        // @ts-expect-error these arguments are not functions
        const results = funcInfo(value);
        expect(results).to.equal(null);
      });
    });
  });

  describe('setCodeEventListener', function () {
    const TIMEOUT = process.platform === 'win32' ? 61000 : 10000;
    this.timeout(TIMEOUT);

    let waitForLazyCompile;
    let handler;

    before(function (done) {
      const events = [];
      let eventIndex = 0;

      waitForLazyCompile = (name) =>
        new Promise((resolve) => {
          const _interval = setInterval(() => {
            for (let i = eventIndex; i < events.length; i++, eventIndex++) {
              if (events[i].func === name) {
                clearInterval(_interval);
                resolve(events[i]);
                return;
              }
            }
          }, 10);
        });

      handler = (event) => {
        // this is technically a memory leak as we're just always
        // appending to the array of events and never releasing them
        // to be GC'ed.  Not a good idea in practice, but fine for
        // these unit tests
        events.push(event);
      };

      setCodeEventListener(handler);

      // in CI it takes a long time for windows to get through the initial burst
      // of available code events
      if (process.platform === 'win32') {
        setTimeout(done, TIMEOUT - 1000);
      } else {
        done();
      }
    });

    after(function () {
      stopListening();
    });

    it('reports simple LazyCompile events', async function () {
      function testfunc1() {
        return 1 + 2;
      }

      testfunc1();

      const event = await waitForLazyCompile('testfunc1');
      expect(event).to.deep.equal({
        func: 'testfunc1',
        lineNumber: 133,
        script: __filename,
        type: 'LazyCompile',
      });
    });

    it('reports arrow function', async function () {
      const testfunc2 = () => 1 + 2;

      testfunc2();

      const event = await waitForLazyCompile('testfunc2');
      expect(event).to.deep.equal({
        func: 'testfunc2',
        lineNumber: 149,
        script: __filename,
        type: 'LazyCompile',
      });
    });

    it('reports class functions', async function () {
      class MyClass {
        constructor() {
          this.foo = 123;
        }

        bar() {
          return this.foo + 2;
        }
      }

      const instance = new MyClass();
      instance.bar();

      const event1 = await waitForLazyCompile('MyClass');
      expect(event1).to.deep.equal({
        func: 'MyClass',
        lineNumber: 164,
        script: __filename,
        type: 'LazyCompile',
      });

      const event2 = await waitForLazyCompile('bar');
      expect(event2).to.deep.equal({
        func: 'bar',
        lineNumber: 168,
        script: __filename,
        type: 'LazyCompile',
      });
    });

    it('reports delayed function', async function () {
      const declareTime = Date.now();

      const testfunc3 = () => 1 + 2;
      setTimeout(testfunc3, 1500);

      const event = await waitForLazyCompile('testfunc3');
      expect(event).to.deep.equal({
        func: 'testfunc3',
        lineNumber: 196,
        script: __filename,
        type: 'LazyCompile',
      });

      // setTimeout isn't exact but it should be close to 1.5 seconds after declaration
      expect(Date.now() - declareTime).to.be.above(1250);
    });

    it('should be able to change the listener function', async function () {
      let newListenerCalled = false;
      setCodeEventListener(function (event) {
        newListenerCalled = true;
        handler(event);
      });

      const testfunc4 = () => 1 + 2;
      testfunc4();

      const event = await waitForLazyCompile('testfunc4');
      expect(newListenerCalled).to.be.true;
      expect(event).to.deep.equal({
        func: 'testfunc4',
        lineNumber: 218,
        script: __filename,
        type: 'LazyCompile',
      });
    });
  });
});
