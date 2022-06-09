#include "func-info.h"

using namespace v8;

NAN_METHOD(FuncInfo) {
    Local<Function> fn = info[0].As<Function>();

    Local<Object> obj = Nan::New<Object>();
    Local<Value> resourceName = fn->GetScriptOrigin().ResourceName();

    if (!resourceName.IsEmpty()) {
        Nan::Set(obj, Nan::New<String>("file").ToLocalChecked(), resourceName);
        Nan::Set(obj,
                 Nan::New<String>("lineNumber").ToLocalChecked(),
                 Nan::New<Integer>(fn->GetScriptLineNumber()));
    }

    info.GetReturnValue().Set(obj);
}
