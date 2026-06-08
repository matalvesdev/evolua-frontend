import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/plugins/events.js
var MAX_BUFFER = 1e3;
var PluginEventBuffer = class {
  buffer = [];
  subscribers = /* @__PURE__ */ new Set();
  nextId = 1;
  record(input) {
    const event = {
      id: this.nextId++,
      at: Date.now(),
      kind: input.kind,
      pluginId: input.pluginId,
      ...input.details ? { details: input.details } : {}
    };
    this.buffer.push(event);
    if (this.buffer.length > MAX_BUFFER) {
      this.buffer = this.buffer.slice(this.buffer.length - MAX_BUFFER);
    }
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch {
      }
    }
    return event;
  }
  // Returns a copy of the current buffer slice (since `since`
  // exclusive). Pass since=0 (or omit) for the whole buffer.
  snapshot(since = 0) {
    if (since <= 0)
      return this.buffer.slice();
    return this.buffer.filter((e) => e.id > since);
  }
  // Subscribe to live events. Returns an unsubscribe callback.
  subscribe(fn) {
    this.subscribers.add(fn);
    return () => {
      this.subscribers.delete(fn);
    };
  }
  // Test-only reset. Production callers never invoke this.
  reset() {
    this.buffer = [];
    this.subscribers.clear();
    this.nextId = 1;
  }
  size() {
    return this.buffer.length;
  }
};
var singleton = new PluginEventBuffer();
function recordPluginEvent(input) {
  return singleton.record(input);
}
function pluginEventSnapshot(since) {
  return singleton.snapshot(since);
}
function subscribePluginEvents(fn) {
  return singleton.subscribe(fn);
}
function pluginEventBufferSize() {
  return singleton.size();
}
function __resetPluginEventBufferForTests() {
  singleton.reset();
}
function purgePluginEventBuffer() {
  const events = singleton.snapshot();
  const result = {
    purged: events.length,
    firstId: events.length > 0 ? events[0].id : null,
    lastId: events.length > 0 ? events[events.length - 1].id : null,
    preNextId: singleton.nextId
  };
  singleton.reset();
  return result;
}
function summarisePluginEvents(events) {
  const stats = {
    total: events.length,
    byKind: {},
    byPluginId: {},
    oldestAt: null,
    newestAt: null,
    firstId: null,
    lastId: null
  };
  for (const ev of events) {
    stats.byKind[ev.kind] = (stats.byKind[ev.kind] ?? 0) + 1;
    if (ev.pluginId) {
      stats.byPluginId[ev.pluginId] = (stats.byPluginId[ev.pluginId] ?? 0) + 1;
    }
    if (typeof ev.at === "number") {
      stats.oldestAt = stats.oldestAt === null ? ev.at : Math.min(stats.oldestAt, ev.at);
      stats.newestAt = stats.newestAt === null ? ev.at : Math.max(stats.newestAt, ev.at);
    }
    if (typeof ev.id === "number") {
      stats.firstId = stats.firstId === null ? ev.id : Math.min(stats.firstId, ev.id);
      stats.lastId = stats.lastId === null ? ev.id : Math.max(stats.lastId, ev.id);
    }
  }
  return stats;
}

export {
  recordPluginEvent,
  pluginEventSnapshot,
  subscribePluginEvents,
  pluginEventBufferSize,
  __resetPluginEventBufferForTests,
  purgePluginEventBuffer,
  summarisePluginEvents
};
