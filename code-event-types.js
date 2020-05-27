'use strict';

/*
  V(BUILTIN_TAG, Builtin)                          \
  V(CALLBACK_TAG, Callback)                        \
  V(EVAL_TAG, Eval)                                \
  V(FUNCTION_TAG, Function)                        \
  V(INTERPRETED_FUNCTION_TAG, InterpretedFunction) \
  V(HANDLER_TAG, Handler)                          \
  V(BYTECODE_HANDLER_TAG, BytecodeHandler)         \
  V(LAZY_COMPILE_TAG, LazyCompile)                 \
  V(REG_EXP_TAG, RegExp)                           \
  V(SCRIPT_TAG, Script)                            \
  V(STUB_TAG, Stub)                                \
  V(NATIVE_FUNCTION_TAG, Function)                 \
  V(NATIVE_LAZY_COMPILE_TAG, LazyCompile)          \
  V(NATIVE_SCRIPT_TAG, Script)
*/
module.exports = [
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
  'NATIVE_SCRIPT'
];
