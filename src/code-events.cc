// code_events.cc
#include <node.h>
#include <v8-profiler.h>
#include <iostream>
#include <string.h>
#include <sys/types.h>

#include "event-queue.h"

namespace codeevents {

using v8::CodeEvent;
using v8::CodeEventHandler;
using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::Integer;
using v8::Number;
using v8::Isolate;
using v8::Local;
using v8::NewStringType;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;

class FnInspectCodeEventHandler : public CodeEventHandler {
  public:
    FnInspectCodeEventHandler(Isolate *isolate) : CodeEventHandler(isolate) {
      this->isolate = isolate;
    }

    void Handle(CodeEvent *event) {
      /*
       * If Handle() is invoked from a worker thread (i.e. during
       * garbage collection) we don't have access to the isolate
       * so just bail
       */
      if (v8::Isolate::GetCurrent() != isolate) {
        return;
      }
      events.enqueue(event, isolate);
    }
    EventNode *dequeue() {
      return this->events.dequeue();
    }
    unsigned int eventCount() {
      return this->events.length;
    }
  private:
    Isolate *isolate;
    EventQueue events; 
};

FnInspectCodeEventHandler *handler;

void Init(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  handler = new FnInspectCodeEventHandler(isolate);
  handler->Enable();
}

void DeInit(const FunctionCallbackInfo<Value>& args) {
  delete handler;
  handler = NULL;
}

void GetNext(const FunctionCallbackInfo<Value>& args) {
  EventNode *node = handler->dequeue();
  if (node) {
    Isolate* isolate = args.GetIsolate();
    Local<Context> context = isolate->GetCurrentContext();
    Local<Object> obj = Object::New(isolate);
    obj->Set(context,
           String::NewFromUtf8(isolate,
                               "script",
                               NewStringType::kNormal).ToLocalChecked(),
           String::NewFromUtf8(isolate,
                               node->script,
                               NewStringType::kNormal).ToLocalChecked())
           .FromJust();
    obj->Set(context,
           String::NewFromUtf8(isolate,
                               "func",
                               NewStringType::kNormal).ToLocalChecked(),
           String::NewFromUtf8(isolate,
                               node->func,
                               NewStringType::kNormal).ToLocalChecked())
           .FromJust();
    obj->Set(context,
           String::NewFromUtf8(isolate,
                               "type",
                               NewStringType::kNormal).ToLocalChecked(),
           Integer::New(isolate, node->type))
           .FromJust();
    obj->Set(context,
           String::NewFromUtf8(isolate,
                               "lineNum",
                               NewStringType::kNormal).ToLocalChecked(),
           Integer::New(isolate, node->lineNum))
           .FromJust();
    args.GetReturnValue().Set(obj);
    delete node;
  }
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "init", Init);
  NODE_SET_METHOD(exports, "deinit", DeInit);
  NODE_SET_METHOD(exports, "getNext", GetNext);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

}  // namespace codeevents
