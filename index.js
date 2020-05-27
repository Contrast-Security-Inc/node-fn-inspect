'use strict';
let codeEventsInited, codeEventListener, _interval;
const version = process.version.split('.')[0].substring(1);
const codeEventTypes = require('./codeEventTypes');

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
}

const { funcinfo } = modLoad('funcinfo.node');
const codeEvents = modLoad('code_events.node');

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

  setCodeEventListener: (cb) => {
    if (!codeEventsInited) {
      codeEvents.init();
      codeEventsInited = true;
      codeEventListener = cb;
      _interval = setInterval(() => {
        const codeEvent = codeEvents.getNext();
        if (codeEvent) {
          codeEvent.type = codeEventTypes[codeEvent.type];
          codeEvent.ts = new Date(codeEvent.ts);
          codeEventListener(codeEvent);
        }
      }, 1); // TODO configurable frequency?
    } else {
      codeEventListener = cb;
    }
  },

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
