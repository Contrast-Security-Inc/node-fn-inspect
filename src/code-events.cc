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
      v8::Locker locker(isolate);
      if (event->GetCodeType() == 8) {
        //std::cout << "addr: " << event->GetCodeStartAddress() << std::endl;
	//std::cout << "size: " << event->GetCodeSize() << std::endl;
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
    obj->Set(context,
           String::NewFromUtf8(isolate,
		               "ts",
			       NewStringType::kNormal).ToLocalChecked(),
	   Number::New(isolate, node->ts))
	   .FromJust();
    obj->Set(context,
           String::NewFromUtf8(isolate, "addr", NewStringType::kNormal).ToLocalChecked(),
	   Number::New(isolate, node->addr))
	   .FromJust();
    obj->Set(context,
           String::NewFromUtf8(isolate, "codeSize", NewStringType::kNormal).ToLocalChecked(),
	   Number::New(isolate, node->codeSize))
	   .FromJust();

    args.GetReturnValue().Set(obj);
    delete node;
  }
}

void Override(const FunctionCallbackInfo<Value>& args) {
  Local<v8::Number> targetAddr = Local<v8::Number>::Cast(args[0]);
  Local<v8::Number> sourceAddr = Local<v8::Number>::Cast(args[1]);
  Local<v8::Number> codeSize = Local<v8::Number>::Cast(args[2]);
  uintptr_t targetPtr = (uintptr_t) targetAddr->Value();
  uintptr_t sourcePtr = (uintptr_t) sourceAddr->Value();
  size_t size = (size_t) codeSize->Value();
  std::cout << "start memcpy??" << std::endl;
  std::cout << "targetAddr: " << std::hex << targetPtr << std::endl;
  memcpy((void *)targetPtr, (void *)sourcePtr, size);
  std::cout << "done memcpy??" << std::endl;
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "init", Init);
  NODE_SET_METHOD(exports, "deinit", DeInit);
  NODE_SET_METHOD(exports, "getNext", GetNext);
  NODE_SET_METHOD(exports, "override", Override);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

}  // namespace codeevents
