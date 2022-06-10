#include "func-info.h"

using namespace v8;

NAN_METHOD(funcInfo) {
    Local<Function> fn = info[0].As<Function>();

    Local<Object> obj = Nan::New<Object>();
    Local<Value> resourceName = fn->GetScriptOrigin().ResourceName();

    if (!resourceName.IsEmpty()) {
        Nan::Set(obj, Nan::New("file").ToLocalChecked(), resourceName);
        Nan::Set(obj,
                 Nan::New("lineNumber").ToLocalChecked(),
                 Nan::New(fn->GetScriptLineNumber()));
    }

    info.GetReturnValue().Set(obj);
}
