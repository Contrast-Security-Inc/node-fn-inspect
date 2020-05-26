'use strict';
let funcinfo, codeEvents, codeEventsInited, codeEventListeners;
const funcinfo_modname = 'funcinfo.node';
const code_events_modname = 'code_events.node';
const version = process.version.split('.')[0].substring(1);
const codeEventTypes = require('./codeEventTypes');

codeEventsInited = false;
codeEventListeners = [];

try {
  ({ funcinfo } = require(`./build/Release/${funcinfo_modname}`));
} catch (e) {
  ({
    funcinfo
  } = require(`${__dirname}/${process.platform}-${version}/${funcinfo_modname}`));
}
try {
  codeEvents = require(`./build/Release/${code_events_modname}`);
} catch (e) {
  codeEvents = require(`${__dirname}/${process.platform}-${version}/${code_events_modname}`);
}

/**
 * Retrieves name, type, lineNumber and file from a function reference
 *
 * @param {function} fn function reference to obtain info
 * @return {object}
 */
module.exports = {
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

  addCodeEventListener: (cb) => {
    if (!codeEventsInited) {
      codeEvents.init();
      codeEventsInited = true;
      codeEventListeners = [cb];
      setInterval(() => {
        const codeEvent = codeEvents.getNext();
        if (codeEvent) {
          codeEvent.type = codeEventTypes[codeEvent.type];
          codeEvent.ts = new Date(
            codeEvent.tv_sec * 1000 + codeEvent.tv_usec / 1000
          );
          delete codeEvent.tv_usec;
          delete codeEvent.tv_sec;
          codeEventListeners.forEach((l) => {
            l(codeEvent);
          });
        }
      }, 1).unref(); // TODO configurable frequency?
    } else {
      codeEventListeners.push(cb);
    }
  }
};
