#ifndef CODE_EVENTS_H_
#define CODE_EVENTS_H_

#include <nan.h>
#include <v8-profiler.h>
#include <v8.h>

#include "event-queue.h"

NAN_METHOD(InitHandler);
NAN_METHOD(DeinitHandler);
NAN_METHOD(GetNext);

#endif // CODE_EVENTS_H_
