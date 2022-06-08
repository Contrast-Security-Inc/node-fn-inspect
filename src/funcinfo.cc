#include <nan.h>
#include <v8.h>

#include "funcinfo.h"

NAN_METHOD(FuncInfo) {

    v8::Local<v8::Function> f = v8::Local<v8::Function>::Cast(info[0]);
    v8::Isolate *isolate = info.GetIsolate();
    v8::Local<v8::Context> context = isolate->GetCurrentContext();

    v8::Local<v8::Object> obj = v8::Object::New(isolate);
    v8::Local<v8::Value> resourceName = f->GetScriptOrigin().ResourceName();

    if (!resourceName.IsEmpty()) {
        obj->Set(
            context,
            v8::String::NewFromUtf8(isolate, "file", v8::NewStringType::kNormal)
                .ToLocalChecked(),
            resourceName);
        obj->Set(context,
                 v8::String::NewFromUtf8(isolate, "lineNumber",
                                         v8::NewStringType::kNormal)
                     .ToLocalChecked(),
                 v8::Integer::New(isolate, f->GetScriptLineNumber()));
    }

    info.GetReturnValue().Set(obj);
}
