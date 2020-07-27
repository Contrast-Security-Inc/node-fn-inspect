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
    }, 1);
  });
}

function handler(event) {
  // this is technically a memory leak as we're just always
  // appending to the array of events and never releasing them
  // to be GC'ed.  Not a good idea in practice, but fine for
  // these unit tests
  events.push(event);
}

describe('addCodeEventListener tests', function() {
  before(function(done) {
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

  after(function() {
    stopListening();
    events = [];
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
    const declareTime = Date.now();
    const testfunc3 = () => 1 + 2;
    setTimeout(testfunc3, 1500);
    return waitForLazyCompile({ name: 'testfunc3' }).then((event) => {
      expect(event.script).to.equal(__filename);
      // settimeout isn't exact but it should be a close to 1.5 seconds after declaration
      expect(event.ts.getTime() - declareTime).to.be.above(1250);
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
