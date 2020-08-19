'use strict';
let codeEventsInited, codeEventListener, _interval;
const version = process.version.split('.')[0].substring(1);
const codeEventTypes = require('./code-event-types');

codeEventsInited = false;

function modLoad(name) {
  const locations = [
    `./build/Debug/${name}`,
    `./build/Release/${name}`,
    `${__dirname}/${process.platform}-${version}/${name}`
  ];

  for (let i = 0; i < locations.length; i++) {
    try {
      const mod = require(locations[i]);
      return mod;
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
  throw new Error(`failed to load ${name}`);
}

const { funcinfo } = modLoad('funcinfo.node');
const codeEvents = modLoad('codeevents.node');

module.exports = {
  /**
   * Retrieves name, type, lineNumber and file from a function reference
   *
   * @param {function} fn function reference to obtain info
   * @return {object}
   */
  funcinfo: (fn) => {
    if (typeof fn === 'function') {
      const info = funcinfo(fn);
      info.type = fn.__proto__.constructor.name;
      info.method = fn.name;
      return info;
    } else {
      return null;
    }
  },

  /**
   * Sets the function for processing v8 code events.
   * Will start listening for code events if not already listening.
   * starts a timer which polls for an available code event once every `interval` value.
   *
   * @param {function} cb callback function to call
   * @param {Number} [interval=1] how often to get code events in ms
   */
  setCodeEventListener: (cb, interval = 1) => {
    if (!codeEventsInited) {
      codeEvents.init();
      codeEventsInited = true;
      codeEventListener = cb;
      _interval = setInterval(() => {
        const codeEvent = codeEvents.getNext();
        if (codeEvent) {
          codeEvent.type = codeEventTypes[codeEvent.type];
          codeEventListener(codeEvent);
        }
      }, interval);
    } else {
      codeEventListener = cb;
    }
  },

  /**
   * Stop listening for v8 code events
   */
  stopListening: () => {
    if (!codeEventsInited) {
      return;
    }
    clearInterval(_interval);
    codeEvents.deinit();
    codeEventListener = null;
    codeEventsInited = false;
  }
};
