#include <nan.h>
#include <v8.h>

#include "code-events.h"
#include "funcinfo.h"

using namespace v8;

NAN_MODULE_INIT(Init) {
    Local<Object> codeEvents = Nan::New<Object>();

    Nan::Set(codeEvents,
             Nan::New<String>("initHandler").ToLocalChecked(),
             Nan::GetFunction(Nan::New<FunctionTemplate>(InitHandler))
                 .ToLocalChecked());
    Nan::Set(codeEvents,
             Nan::New<String>("deinitHandler").ToLocalChecked(),
             Nan::GetFunction(Nan::New<FunctionTemplate>(DeinitHandler))
                 .ToLocalChecked());
    Nan::Set(
        codeEvents,
        Nan::New<String>("getNext").ToLocalChecked(),
        Nan::GetFunction(Nan::New<FunctionTemplate>(GetNext)).ToLocalChecked());

    Nan::Set(
        target, Nan::New<String>("codeEvents").ToLocalChecked(), codeEvents);

    Nan::Set(target,
             Nan::New<String>("funcinfo").ToLocalChecked(),
             Nan::GetFunction(Nan::New<FunctionTemplate>(FuncInfo))
                 .ToLocalChecked());
}

NODE_MODULE(addon, Init)
