const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getToken() {
  return localStorage.getItem("token");
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers };
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new Error("Cannot reach the backend. Start it in another terminal: cd backend && npm run dev");
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof data === "object" && data?.message ? data.message : `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return data;
}

export function saveSession(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Streams a Server-Sent Events response. Calls onToken for each piece of text.
// Resolves when the stream finishes; rejects with an Error on failure.
export async function streamRequest(path, body, { signal, onToken } = {}) {
  const token = getToken();
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new Error("Cannot reach the backend. Start it in another terminal: cd backend && npm run dev");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try { const data = await response.json(); if (data?.message) message = data.message; } catch { /* not json */ }
    throw new Error(message);
  }
  if (!response.body) throw new Error("Streaming is not supported in this browser.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;

  while (!finished) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const raw of events) {
      const line = raw.split("\n").find(item => item.startsWith("data:"));
      if (!line) continue;
      let payload;
      try { payload = JSON.parse(line.slice(5).trim()); } catch { continue; }
      if (payload.error) throw new Error(payload.error);
      if (payload.token) onToken?.(payload.token);
      if (payload.done) finished = true;
    }
  }
}
