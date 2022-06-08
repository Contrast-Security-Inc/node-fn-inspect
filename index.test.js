'use strict';

const { expect } = require('chai');
const { funcinfo, setCodeEventListener, stopListening } = require('.');

describe('fn-inspect', function () {
  describe('funcinfo', function () {
    const mod = require('./test/resources/module');
    const expectedPath = require.resolve('./test/resources/module.js');

    it('returns the correct info for an arrow function', function () {
      const results = funcinfo(mod.arrow);

      expect(results).to.deep.equal({
        file: expectedPath,
        lineNumber: 3, // line numbers start at 0 in v8
        method: '',
        type: 'Function',
      });
    });

    it('returns the correct info for a named function', function () {
      const results = funcinfo(mod.named);

      expect(results).to.deep.equal({
        file: expectedPath,
        lineNumber: 8, // line numbers start at 0 in v8
        method: 'named',
        type: 'Function',
      });
    });

    it('returns the correct info for an anonymous function', function () {
      const results = funcinfo(mod.anon);

      expect(results).to.deep.equal({
        file: expectedPath,
        lineNumber: 10, // line numbers start at 0 in v8
        method: '',
        type: 'Function',
      });
    });

    it('returns the correct info for an inline function', function () {
      function inline() {}

      const results = funcinfo(inline);
      expect(results).to.deep.equal({
        file: __filename,
        lineNumber: 44, // line numbers start at 0 in v8
        method: 'inline',
        type: 'Function',
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
        const results = funcinfo(value);
        expect(results).to.equal(null);
      });
    });
  });

  describe('addCodeEventListener', function () {
    let events = [];
    let eventIndex = 0;
    function waitForLazyCompile({ name }) {
      return new Promise((resolve) => {
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
    }

    function handler(event) {
      // this is technically a memory leak as we're just always
      // appending to the array of events and never releasing them
      // to be GC'ed.  Not a good idea in practice, but fine for
      // these unit tests
      events.push(event);
    }

    before(function (done) {
      setCodeEventListener(handler);
      // in CI it takes a long time for windows to
      // get through the initial burst of available code events
      if (process.platform === 'win32') {
        this.timeout(61000);
        setTimeout(done, 60000);
      } else {
        done();
      }
    });

    after(function () {
      stopListening();
      events = [];
    });

    it('should report simple lazy_compile events', function () {
      function testfunc1() {
        return 1 + 2;
      }
      testfunc1();
      return waitForLazyCompile({ name: 'testfunc1' }).then((event) => {
        expect(event.script).to.equal(__filename);
      });
    });

    it('should report arrow function', function () {
      const testfunc2 = () => 1 + 2;
      testfunc2();
      return waitForLazyCompile({ name: 'testfunc2' }).then((event) => {
        expect(event.script).to.equal(__filename);
      });
    });

    it('should report class functions', function () {
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
      return waitForLazyCompile({ name: 'MyClass' })
        .then((event) => {
          expect(event.script).to.equal(__filename);
          return waitForLazyCompile({ name: 'bar' });
        })
        .then((event) => {
          expect(event.script).to.equal(__filename);
        });
    });

    it('should report delayed function', function () {
      const declareTime = Date.now();
      const testfunc3 = () => 1 + 2;
      setTimeout(testfunc3, 1500);
      return waitForLazyCompile({ name: 'testfunc3' }).then((event) => {
        expect(event.script).to.equal(__filename);
        // settimeout isn't exact but it should be a close to 1.5 seconds after declaration
        expect(Date.now() - declareTime).to.be.above(1250);
      });
    });

    it('should be able to change the listener function', function () {
      let newListenerCalled = false;
      setCodeEventListener(function (event) {
        events.push(event);
        newListenerCalled = true;
      });

      const testfunc4 = () => 1 + 2;
      testfunc4();
      return waitForLazyCompile({ name: 'testfunc4' }).then((event) => {
        expect(event.script).to.equal(__filename);
        expect(newListenerCalled).to.be.true;
      });
    });
  });
});
