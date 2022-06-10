#include <nan.h>
#include <v8.h>

#include "code-events.h"
#include "func-info.h"

using namespace v8;

NAN_MODULE_INIT(Init) {
    NAN_EXPORT(target, initHandler);
    NAN_EXPORT(target, deinitHandler);
    NAN_EXPORT(target, getNextCodeEvent);

    NAN_EXPORT(target, funcInfo);
}

NODE_MODULE(addon, Init)
