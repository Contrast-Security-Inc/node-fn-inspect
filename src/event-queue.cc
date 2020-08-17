#include "event-queue.h"
#include <iostream>
#include <string.h>

namespace codeevents {

using v8::String;

// TODO need to v8 locker these methods?
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
