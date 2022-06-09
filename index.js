'use strict';

const binding = require('node-gyp-build')(__dirname);

/**
 * ```
 * V(BUILTIN_TAG, Builtin)
 * V(CALLBACK_TAG, Callback)
 * V(EVAL_TAG, Eval)
 * V(FUNCTION_TAG, Function)
 * V(INTERPRETED_FUNCTION_TAG, InterpretedFunction)
 * V(HANDLER_TAG, Handler)
 * V(BYTECODE_HANDLER_TAG, BytecodeHandler)
 * V(LAZY_COMPILE_TAG, LazyCompile)
 * V(REG_EXP_TAG, RegExp)
 * V(SCRIPT_TAG, Script)
 * V(STUB_TAG, Stub)
 * V(NATIVE_FUNCTION_TAG, Function)
 * V(NATIVE_LAZY_COMPILE_TAG, LazyCompile)
 * V(NATIVE_SCRIPT_TAG, Script)
 * ```
 */
const CODE_EVENT_TYPES = [
  '', // 0 unused
  'BUILTIN',
  'CALLBACK',
  'EVAL',
  'FUNCTION',
  'INTERPRETED_FUNCTION',
  'HANDLER',
  'BYTECODE_HANDLER',
  'LAZY_COMPILE',
  'REG_EXP',
  'SCRIPT',
  'STUB',
  'NATIVE_FUNCTION',
  'NATIVE_LAZY_COMPILE',
  'NATIVE_SCRIPT',
];

let codeEventsInited = false;
let codeEventListener = null;
let timer = null;

module.exports = {
  /**
   * Retrieves name, type, lineNumber and file from a function reference
   *
   * @param {Function} fn function reference to obtain info
   * @return {FunctionInfo}
   */
  funcinfo(fn) {
    if (typeof fn === 'function') {
      const info = binding.funcinfo(fn);
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
   * @param {Function} cb callback function to call
   * @param {number} [interval=1] how often to get code events in ms
   */
  setCodeEventListener(cb, interval = 1) {
    if (codeEventsInited) {
      codeEventListener = cb;
      return;
    }

    binding.codeEvents.initHandler();
    codeEventsInited = true;
    codeEventListener = cb;
    timer = setInterval(() => {
      const codeEvent = binding.codeEvents.getNext();
      if (codeEvent) {
        codeEvent.type = CODE_EVENT_TYPES[codeEvent.type];
        codeEventListener(codeEvent);
      }
    }, interval);
  },

  /**
   * Stop listening for v8 code events
   */
  stopListening() {
    if (!codeEventsInited) return;

    clearInterval(timer);
    binding.codeEvents.deinitHandler();
    codeEventListener = null;
    codeEventsInited = false;
  },
};
