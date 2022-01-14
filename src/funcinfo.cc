#include <node.h>

namespace FuncInfo {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::NewStringType;
using v8::Object;
using v8::String;
using v8::Value;
using v8::Integer;
using v8::Null;

void Method(const FunctionCallbackInfo<Value>& args) {

  Local<v8::Function> f = Local<v8::Function>::Cast(args[0]);
  Isolate* isolate = args.GetIsolate();
  Local<v8::Context> context = isolate->GetCurrentContext();

  Local<v8::Object> obj = Object::New(isolate);
  if (!f->GetScriptOrigin().ResourceName().IsEmpty()) {
    obj->Set(context,
             v8::String::NewFromUtf8(isolate, "file", v8::NewStringType::kNormal).ToLocalChecked(),
             f->GetScriptOrigin().ResourceName());
    obj->Set(context,
             v8::String::NewFromUtf8(isolate, "lineNumber", v8::NewStringType::kNormal).ToLocalChecked(),
             v8::Integer::New(isolate, f->GetScriptLineNumber()));
  }

  args.GetReturnValue().Set(obj);
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "funcinfo", Method);
}

NODE_MODULE_INIT() {
  Initialize(exports);
}

}
