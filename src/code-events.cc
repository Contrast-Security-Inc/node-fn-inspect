#include <nan.h>
#include <v8-profiler.h>
#include <v8.h>

#include "code-events.h"
#include "event-queue.h"

class FnInspectCodeEventHandler : public v8::CodeEventHandler {
  public:
    FnInspectCodeEventHandler(v8::Isolate *isolate)
        : v8::CodeEventHandler(isolate) {
        this->isolate = isolate;
    }

    void Handle(v8::CodeEvent *event) {
        /*
         * If Handle() is invoked from a worker thread (i.e. during
         * garbage collection) we don't have access to the isolate
         * so just bail
         */
        if (v8::Isolate::GetCurrent() != isolate) {
            return;
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
    v8::Isolate *isolate;
    EventQueue events;
};

FnInspectCodeEventHandler *handler;

NAN_METHOD(InitHandler) {
    v8::Isolate *isolate = info.GetIsolate();
    handler = new FnInspectCodeEventHandler(isolate);
    handler->Enable();
}

NAN_METHOD(DeinitHandler) {
    delete handler;
    handler = NULL;
}

NAN_METHOD(GetNext) {
    EventNode *node = handler->dequeue();
    if (node) {
        v8::Isolate *isolate = info.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        v8::Local<v8::Object> obj = v8::Object::New(isolate);
        obj->Set(context,
                 v8::String::NewFromUtf8(isolate, "script",
                                         v8::NewStringType::kNormal)
                     .ToLocalChecked(),
                 v8::String::NewFromUtf8(isolate, node->script,
                                         v8::NewStringType::kNormal)
                     .ToLocalChecked())
            .FromJust();
        obj->Set(context,
                 v8::String::NewFromUtf8(isolate, "func",
                                         v8::NewStringType::kNormal)
                     .ToLocalChecked(),
                 v8::String::NewFromUtf8(isolate, node->func,
                                         v8::NewStringType::kNormal)
                     .ToLocalChecked())
            .FromJust();
        obj->Set(context,
                 v8::String::NewFromUtf8(isolate, "type",
                                         v8::NewStringType::kNormal)
                     .ToLocalChecked(),
                 v8::Integer::New(isolate, node->type))
            .FromJust();
        obj->Set(context,
                 v8::String::NewFromUtf8(isolate, "lineNum",
                                         v8::NewStringType::kNormal)
                     .ToLocalChecked(),
                 v8::Integer::New(isolate, node->lineNum))
            .FromJust();
        info.GetReturnValue().Set(obj);
        delete node;
    }
}
