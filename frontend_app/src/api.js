 /* PUBLIC_INTERFACE
  * API helper functions to communicate with the backend service.
  * Reads REACT_APP_BACKEND_BASE_URL from environment with a fallback.
  */
const BASE_URL =
  process.env.REACT_APP_BACKEND_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3001";

/**
 * Internal helper to POST JSON to a given path.
 * Handles JSON parsing, network errors, and non-2xx responses gracefully.
 */
async function postJSON(path, body) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload;
}

// PUBLIC_INTERFACE
export async function postGenerate({ prompt, language, systemPrompt, model } = {}) {
  /** Posts to /generate with the user's prompt and optional parameters.
   * Returns { content, model, usage? } from backend on success.
   */
  if (!prompt || !prompt.trim()) throw new Error("Prompt is required.");
  return postJSON("/generate", { prompt, language, systemPrompt, model });
}

// PUBLIC_INTERFACE
export async function postExplain({ code, language, systemPrompt, model } = {}) {
  /** Posts to /explain with a code snippet and optional parameters.
   * Returns { content, model, usage? } from backend on success.
   */
  if (!code || !code.trim()) throw new Error("Code is required.");
  return postJSON("/explain", { code, language, systemPrompt, model });
}

// PUBLIC_INTERFACE
export async function postDebug({ code, language, error, systemPrompt, model } = {}) {
  /** Posts to /debug with a code snippet, optional language and error details.
   * Returns { content, model, usage? } from backend on success.
   */
  if (!code || !code.trim()) throw new Error("Code is required.");
  return postJSON("/debug", { code, language, error, systemPrompt, model });
}

// PUBLIC_INTERFACE
export function getBaseUrl() {
  /** Returns the effective backend base URL being used by the app. */
  return BASE_URL;
}
