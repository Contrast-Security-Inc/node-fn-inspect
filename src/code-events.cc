#include "code-events.h"
#include "event-queue.h"

using namespace v8;

class FnInspectCodeEventHandler : public CodeEventHandler {
  public:
    FnInspectCodeEventHandler(Isolate *isolate) : CodeEventHandler(isolate) {
        this->isolate = isolate;
    }

    void Handle(CodeEvent *event) {
        /*
         * If Handle() is invoked from a worker thread (i.e. during
         * garbage collection) we don't have access to the isolate
         * so just bail
         */
        if (Isolate::GetCurrent() != isolate) {
            return;
        }
        events.enqueue(event);
    }

    EventNode *dequeue() {
        return this->events.dequeue();
    }

    unsigned int eventCount() {
        return this->events.length;
    }

  private:
    Isolate *isolate;
    EventQueue events;
};

FnInspectCodeEventHandler *handler;

NAN_METHOD(InitHandler) {
    Isolate *isolate = info.GetIsolate();
    handler = new FnInspectCodeEventHandler(isolate);
    handler->Enable();
}

NAN_METHOD(DeinitHandler) {
    delete handler;
    handler = NULL;
}

NAN_METHOD(GetNext) {
    EventNode *node = handler->dequeue();

    if (!node)
        return;

    Local<Object> obj = Nan::New<Object>();

    Nan::Set(obj,
             Nan::New<String>("script").ToLocalChecked(),
             Nan::New<String>(node->script).ToLocalChecked());
    Nan::Set(obj,
             Nan::New<String>("func").ToLocalChecked(),
             Nan::New<String>(node->func).ToLocalChecked());
    Nan::Set(obj,
             Nan::New<String>("type").ToLocalChecked(),
             Nan::New<Integer>(node->type));
    Nan::Set(obj,
             Nan::New<String>("lineNum").ToLocalChecked(),
             Nan::New<Integer>(node->lineNum));

    info.GetReturnValue().Set(obj);

    delete node;
}
