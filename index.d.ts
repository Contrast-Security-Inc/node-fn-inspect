/* eslint-disable @typescript-eslint/ban-types */

declare interface FunctionInfo {
  file: string;
  lineNumber: number;
  method: string;
  type: 'AsyncFunction' | 'Function';
}

declare interface CodeEvent {
  func: string;
  lineNum: number;
  script: string;
  type:
  | 'BUILTIN'
  | 'CALLBACK'
  | 'EVAL'
  | 'FUNCTION'
  | 'INTERPRETED_FUNCTION'
  | 'HANDLER'
  | 'BYTECODE_HANDLER'
  | 'LAZY_COMPILE'
  | 'REG_EXP'
  | 'SCRIPT'
  | 'STUB'
  | 'NATIVE_FUNCTION'
  | 'NATIVE_LAZY_COMPILE'
  | 'NATIVE_SCRIPT';
}

declare const fnInspect: {
  /** Retrieves name, type, lineNumber and file from a function reference */
  funcinfo(fn: Function): FunctionInfo;

  /**
   * Sets the function for processing v8 code events.
   * Will start listening for code events if not already listening.
   * starts a timer which polls for an available code event once every `interval` ms.
   */
  setCodeEventListener(cb: (event: CodeEvent) => void, interval?: number): void;

  /** Stop listening for v8 code events */
  stopListening(): void;
};

export = fnInspect;
