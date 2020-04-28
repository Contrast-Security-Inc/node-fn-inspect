'use strict';
let funcinfo;
const name = 'funcinfo.node';
const version = process.version.split('.')[0].substring(1);

try {
  ({ funcinfo } = require(`./build/Release/${name}`));
} catch (e) {
  ({
    funcinfo
  } = require(`${__dirname}/${process.platform}-${version}/${name}`));
}

/**
 * Retrieves name, type, lineNumber and file from a function reference
 *
 * @param {function} fn function reference to obtain info
 * @return {object}
 */
module.exports = (fn) => {
  if (typeof fn === 'function') {
    const info = funcinfo(fn);
    info.type = fn.__proto__.constructor.name;
    info.method = fn.name;
    return info;
  } else {
    return null;
  }
};
