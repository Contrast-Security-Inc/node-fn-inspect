#include <v8-profiler.h>
#include <uv.h>

namespace codeevents {

using v8::CodeEvent;
using v8::Isolate;

class EventNode {
  public:
    int type;
    char *script;
    char *func;
    int lineNum;
    EventNode *next;
    ~EventNode() {
      free(this->script);
      free(this->func);
    }
};

class EventQueue {
  public:
    EventQueue();
    ~EventQueue();
    void enqueue(CodeEvent *event, Isolate *isolate);
    EventNode *dequeue();
    unsigned int length;
  private:
    EventNode *head;
    EventNode *tail;
};
}
