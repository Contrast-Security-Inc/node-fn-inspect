#include "event-queue.h"
#include <iostream>
#include <string.h>

/*
 * Implements a simple queue of code events that can be
 * consumed.
 *
 * Thread-Safety: There's no locking on these methods so
 * they aren't thread safe.  However this should be OK
 * as the expectation is these methods are only ever called
 * from the main JS thread and they are blocking, there will
 * only ever be a single thread calling it as a time.  We
 * may want to revisit this if we ever want to support
 * handling events from worker_threads.
 */
namespace codeevents {

using v8::String;

EventQueue::EventQueue() {
  this->head = NULL;
  this->tail = NULL;
  this->length = 0;
}

EventQueue::~EventQueue() {
  EventNode *tmp;
  while (this->head) {
    tmp = this->head;;
    this->head = this->head->next;
    delete tmp;
  }
}

void EventQueue::enqueue(CodeEvent *event, Isolate *isolate) {
  if (v8::String::Utf8Value(isolate, event->GetScriptName()).length() == 0) {
    return;
  }
  EventNode *node = new EventNode();
  node->type = event->GetCodeType();
  node->script = strdup(*v8::String::Utf8Value(isolate, event->GetScriptName()));
  node->func = strdup(*v8::String::Utf8Value(isolate, event->GetFunctionName()));
  node->lineNum = event->GetScriptLine();
  if (this->tail) {
    this->tail->next = node;
    this->tail = node;
  } else {
    this->head = node;
    this->tail = node;
  }
  this->length += 1;
}

EventNode *EventQueue::dequeue() {
  EventNode *node = this->head;
  if (node) {
    this->head = this->head->next;
    if (this->head == NULL) {
      this->tail = NULL;
    }
    this->length -= 1;
    return node;
  } else {
    return NULL;
  }
}
}
