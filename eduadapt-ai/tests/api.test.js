import test, { describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { streamRequest, apiRequest, saveSession, clearSession, getToken } from "../src/services/api.js";

function sse(chunks) {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  }), { status: 200, headers: { "content-type": "text/event-stream" } });
}

const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: (key) => { delete store[key]; },
};
const originalFetch = globalThis.fetch;
function mockFetch(handler) {
  const calls = [];
  globalThis.fetch = async (...args) => {
    calls.push(args);
    return handler(...args);
  };
  return calls;
}

beforeEach(() => {
  delete store.token;
  delete store.user;
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  delete store.token;
  delete store.user;
});

describe("streamRequest", () => {
  test("emits tokens when events are split across network chunks", async () => {
    mockFetch(async () => sse([
      'data: {"token":"Hel"}\n\ndata: {"tok',
      'en":"lo"}\n\n',
      'data: {"done":true}\n\n',
    ]));
    const received = [];
    await streamRequest("/ai/teach/stream", { question: "hi" }, { onToken: (token) => received.push(token) });
    assert.equal(received.join(""), "Hello");
  });

  test("supports CRLF event separators and flushes a final event without a blank line", async () => {
    mockFetch(async () => sse(['data: {"token":"Hi"}\r\n\r\ndata: {"done":true}']));
    const received = [];
    await streamRequest("/x", {}, { onToken: (token) => received.push(token) });
    assert.deepEqual(received, ["Hi"]);
  });

  test("throws a server error event", async () => {
    mockFetch(async () => sse(['data: {"error":"rate limited"}\n\n']));
    await assert.rejects(streamRequest("/x", {}), /rate limited/);
  });

  test("ignores malformed events without stopping a valid stream", async () => {
    mockFetch(async () => sse([
      'data: not-json\n\ndata: {"token":"ok"}\n\ndata: {"done":true}\n\n',
    ]));
    const received = [];
    await streamRequest("/x", {}, { onToken: (token) => received.push(token) });
    assert.deepEqual(received, ["ok"]);
  });

  test("uses bearer authentication and JSON request bodies", async () => {
    store.token = "session-token";
    const calls = mockFetch(async () => sse(['data: {"done":true}\n\n']));
    await streamRequest("/ai/teach/stream", { question: "test" });
    assert.equal(calls[0][1].method, "POST");
    assert.equal(calls[0][1].headers.Authorization, "Bearer session-token");
    assert.equal(calls[0][1].headers["Content-Type"], "application/json");
    assert.equal(calls[0][1].body, JSON.stringify({ question: "test" }));
  });

  test("surfaces the JSON message for HTTP errors", async () => {
    mockFetch(async () => new Response(JSON.stringify({ message: "Missing key" }), {
      status: 503, headers: { "content-type": "application/json" },
    }));
    await assert.rejects(streamRequest("/x", {}), /Missing key/);
  });

  test("explains when the backend is unreachable", async () => {
    mockFetch(async () => { throw new TypeError("fetch failed"); });
    await assert.rejects(streamRequest("/x", {}), /Cannot reach the backend/);
  });

  test("rethrows abort errors untouched", async () => {
    mockFetch(async () => { throw new DOMException("aborted", "AbortError"); });
    await assert.rejects(streamRequest("/x", {}), { name: "AbortError" });
  });

  test("reports browsers without streaming response support", async () => {
    mockFetch(async () => new Response(null, { status: 200 }));
    await assert.rejects(streamRequest("/x", {}), /Streaming is not supported/);
  });
});

describe("apiRequest and session helpers", () => {
  test("sends the bearer token and parses JSON", async () => {
    store.token = "abc";
    const calls = mockFetch(async () => new Response(JSON.stringify({ ok: 1 }), {
      status: 200, headers: { "content-type": "application/json" },
    }));
    assert.deepEqual(await apiRequest("/performance/me"), { ok: 1 });
    assert.equal(calls[0][1].headers.Authorization, "Bearer abc");
  });

  test("does not overwrite an explicitly provided authorization header", async () => {
    store.token = "stored-token";
    const calls = mockFetch(async () => new Response("ok", { status: 200 }));
    await apiRequest("/custom", { headers: { Authorization: "Bearer custom-token" } });
    assert.equal(calls[0][1].headers.Authorization, "Bearer custom-token");
  });

  test("adds JSON content type when a request body is present", async () => {
    const calls = mockFetch(async () => new Response("ok", { status: 200 }));
    await apiRequest("/custom", { method: "POST", body: "{}" });
    assert.equal(calls[0][1].headers["Content-Type"], "application/json");
  });

  test("throws the server message on JSON failure responses", async () => {
    mockFetch(async () => new Response(JSON.stringify({ message: "Bad login" }), {
      status: 401, headers: { "content-type": "application/json" },
    }));
    await assert.rejects(apiRequest("/auth/login"), /Bad login/);
  });

  test("uses the HTTP status when an error response is not JSON", async () => {
    mockFetch(async () => new Response("temporarily unavailable", { status: 503 }));
    await assert.rejects(apiRequest("/status"), /Request failed \(503\)\./);
  });

  test("normalizes network errors into an actionable message", async () => {
    mockFetch(async () => { throw new TypeError("offline"); });
    await assert.rejects(apiRequest("/status"), /Cannot reach the backend/);
  });

  test("saves and clears the authenticated session", () => {
    saveSession({ token: "abc", user: { name: "Ada" } });
    assert.equal(getToken(), "abc");
    assert.deepEqual(JSON.parse(store.user), { name: "Ada" });
    clearSession();
    assert.equal(getToken(), null);
    assert.equal(store.user, undefined);
  });
});
