#ifndef CODE_EVENTS_H_
#define CODE_EVENTS_H_

#include <nan.h>
#include <v8-profiler.h>
#include <v8.h>

#include "event-queue.h"

NAN_METHOD(initHandler);
NAN_METHOD(deinitHandler);
NAN_METHOD(getNextCodeEvent);

#endif // CODE_EVENTS_H_
