#include <nan.h>
#include <v8.h>

#include "code-events.h"
#include "funcinfo.h"

NAN_MODULE_INIT(Init) {
    v8::Local<v8::Object> codeEvents = Nan::New<v8::Object>();

    Nan::Set(codeEvents, Nan::New<v8::String>("initHandler").ToLocalChecked(),
             Nan::GetFunction(Nan::New<v8::FunctionTemplate>(InitHandler))
                 .ToLocalChecked());
    Nan::Set(codeEvents, Nan::New<v8::String>("deinitHandler").ToLocalChecked(),
             Nan::GetFunction(Nan::New<v8::FunctionTemplate>(DeinitHandler))
                 .ToLocalChecked());
    Nan::Set(codeEvents, Nan::New<v8::String>("getNext").ToLocalChecked(),
             Nan::GetFunction(Nan::New<v8::FunctionTemplate>(GetNext))
                 .ToLocalChecked());

    Nan::Set(target, Nan::New<v8::String>("codeEvents").ToLocalChecked(),
             codeEvents);

    Nan::Set(target, Nan::New<v8::String>("funcinfo").ToLocalChecked(),
             Nan::GetFunction(Nan::New<v8::FunctionTemplate>(FuncInfo))
                 .ToLocalChecked());
}

NODE_MODULE(addon, Init)
