import { describe, it, expect, vi, afterEach } from "vitest";
import { streamRequest, apiRequest } from "../src/services/api";

function sse(chunks) {
  const enc = new TextEncoder();
  return new Response(new ReadableStream({
    start(c) { chunks.forEach((x) => c.enqueue(enc.encode(x))); c.close(); },
  }), { status: 200, headers: { "content-type": "text/event-stream" } });
}

const store = {};
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };

afterEach(() => { vi.restoreAllMocks(); });

describe("streamRequest", () => {
  it("emits tokens, including events split across chunks", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => sse(['data: {"token":"Hel"}\n\ndata: {"tok', 'en":"lo"}\n\n', 'data: {"done":true}\n\n'])));
    const got = [];
    await streamRequest("/ai/teach/stream", { question: "hi" }, { onToken: (t) => got.push(t) });
    expect(got.join("")).toBe("Hello");
  });
  it("throws the server's error event", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => sse(['data: {"error":"rate limited"}\n\n'])));
    await expect(streamRequest("/x", {})).rejects.toThrow("rate limited");
  });
  it("surfaces the JSON message for HTTP errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ message: "Missing key" }), { status: 503, headers: { "content-type": "application/json" } })));
    await expect(streamRequest("/x", {})).rejects.toThrow("Missing key");
  });
  it("explains when the backend is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("fetch failed"); }));
    await expect(streamRequest("/x", {})).rejects.toThrow(/Cannot reach the backend/);
  });
  it("rethrows aborts untouched", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new DOMException("aborted", "AbortError"); }));
    await expect(streamRequest("/x", {})).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("apiRequest", () => {
  it("sends the bearer token and parses JSON", async () => {
    store.token = "abc";
    const spy = vi.fn(async () => new Response(JSON.stringify({ ok: 1 }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", spy);
    expect(await apiRequest("/performance/me")).toEqual({ ok: 1 });
    expect(spy.mock.calls[0][1].headers.Authorization).toBe("Bearer abc");
  });
  it("throws the server message on failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ message: "Bad login" }), { status: 401, headers: { "content-type": "application/json" } })));
    await expect(apiRequest("/auth/login")).rejects.toThrow("Bad login");
  });
});
