import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "../app.js";

const originalGroqKey = process.env.GROQ_API_KEY;
delete process.env.GROQ_API_KEY;

const app = createApp({ clientUrl: "http://localhost:5173" });
let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroqKey;
});

async function get(path, options = {}) {
  return fetch(`${baseUrl}${path}`, options);
}

async function postJson(path, body, headers = {}) {
  return get(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

test("root endpoint confirms that the API is running", async () => {
  const response = await get("/");
  assert.equal(response.status, 200);
  assert.match(await response.text(), /EduXai API is running/);
  assert.equal(response.headers.get("x-powered-by"), null);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
});

test("health endpoint reports service and dependency state without secrets", async () => {
  const response = await get("/api/health");
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.status, "ok");
  assert.equal(data.service, "EduXai API");
  assert.ok(["connected", "disconnected"].includes(data.database));
  assert.equal(data.groqConfigured, false);
  assert.equal("mongoUri" in data, false);
});

test("AI health endpoint reports whether the provider key is configured", async () => {
  const response = await get("/api/ai/health");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { configured: false, provider: "Groq" });
});

test("AI endpoint rejects an empty question before calling the provider", async () => {
  const response = await postJson("/api/ai/teach", { question: "   " });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, "Please type a question first.");
});

test("AI endpoint rejects questions that exceed the documented limit", async () => {
  const response = await postJson("/api/ai/teach", { question: "x".repeat(3001) });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /under 3000 characters/);
});

test("AI endpoint gives a clear configuration error when the provider key is missing", async () => {
  const response = await postJson("/api/ai/teach", { question: "Explain normalization." });
  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /GROQ_API_KEY/);
});

test("protected database features return 503 while MongoDB is disconnected", async () => {
  const response = await get("/api/assessment/topics");
  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /Database is not connected/);
});

test("unknown routes return a stable JSON 404", async () => {
  const response = await get("/api/not-a-route");
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { message: "API route not found." });
});

test("malformed JSON is rejected with HTTP 400", async () => {
  const response = await get("/api/ai/teach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"question":',
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: "Invalid JSON request body." });
});

test("oversized JSON is rejected with HTTP 413", async () => {
  const response = await get("/api/ai/teach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: "x".repeat(110_000) }),
  });
  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), { message: "Request body is too large." });
});

test("requests from an unapproved browser origin are rejected", async () => {
  const response = await get("/", { headers: { Origin: "https://untrusted.example" } });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { message: "This website origin is not allowed." });
});

test("approved browser origin receives the CORS allow-origin header", async () => {
  const response = await get("/", { headers: { Origin: "http://localhost:5173" } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
});
