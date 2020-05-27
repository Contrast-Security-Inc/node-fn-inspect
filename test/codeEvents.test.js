'use strict';
// eslint-disable-next-line node/no-unpublished-require
const { expect } = require('chai');

let setCodeEventListener, stopListening;

if (process.env.USE_ARTIFACT) {
  // eslint-disable-next-line node/no-missing-require
  ({ setCodeEventListener, stopListening } = require('../prebuilt/index'));
  console.log(
    `Running tests with prebuilt for ${process.platform} ${process.version}`
  );
} else {
  ({ setCodeEventListener, stopListening } = require('..'));
  console.log('Running with locally built module');
}

const events = [];
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

describe('addCodeEventListener tests', function() {
  beforeEach(function() {
    setCodeEventListener(function(event) {
      events.push(event);
    });
  });

  after(function() {
    stopListening();
  });

  it('should report simple lazy_compile events', function() {
    function testfunc1() {
      return 1 + 2;
    }
    testfunc1();
    return waitForLazyCompile({ name: 'testfunc1' }).then((event) => {
      expect(event.script).to.equal(__filename);
    });
  });

  it('should report arrow function', function() {
    const testfunc2 = () => 1 + 2;
    testfunc2();
    return waitForLazyCompile({ name: 'testfunc2' }).then((event) => {
      expect(event.script).to.equal(__filename);
    });
  });

  it('should report class functions', function() {
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

  it('should report delayed function', function() {
    const testfunc3 = () => 1 + 2;
    setTimeout(testfunc3, 1000);
    return waitForLazyCompile({ name: 'testfunc3' }).then((event) => {
      expect(event.script).to.equal(__filename);
    });
  });

  it('should be able to change the listener function', function() {
    let newListenerCalled = false;
    setCodeEventListener(function(event) {
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
