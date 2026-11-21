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
  } catch {
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
