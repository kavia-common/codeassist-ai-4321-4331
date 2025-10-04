 /* PUBLIC_INTERFACE
  * API helper functions to communicate with the backend service.
  * Reads REACT_APP_BACKEND_BASE_URL from environment with a fallback.
  */
const BASE_URL =
  process.env.REACT_APP_BACKEND_BASE_URL?.replace(/\/*$/, "") || "http://localhost:3001";

/**
 * Quick guard: warn about likely mixed-content when frontend is HTTPS but base URL is HTTP.
 */
function checkMixedContent(baseUrl) {
  const locProto = typeof window !== "undefined" ? window.location.protocol : "";
  if (locProto === "https:" && baseUrl.startsWith("http://")) {
    // Mixed content likely blocked by browser
    throw new Error(
      `Frontend is served over HTTPS but backend base URL is HTTP (${baseUrl}). ` +
        `Browsers block mixed content. Set REACT_APP_BACKEND_BASE_URL to an HTTPS URL matching your backend (e.g., https://<host>:3001).`
    );
  }
}

/**
 * Internal helper to POST JSON to a given path.
 * Handles JSON parsing, network errors, and non-2xx responses gracefully.
 */
async function postJSON(path, body) {
  const url = `${BASE_URL}${path}`;
  // Check for mixed content early
  checkMixedContent(BASE_URL);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    const details = networkErr?.message || "Network request failed.";
    const hint =
      `Failed to reach ${url}. Ensure the backend is running and CORS/base URL are configured. ` +
      `If using a preview, set REACT_APP_BACKEND_BASE_URL to your backend origin (e.g., https://<host>:3001).`;
    const err = new Error(`${details} ${hint}`);
    err.cause = networkErr;
    throw err;
  }

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
    err.url = url;
    throw err;
  }
  return payload;
}

/**
 * Internal helper to GET JSON from a given path.
 */
async function getJSON(path) {
  const url = `${BASE_URL}${path}`;
  checkMixedContent(BASE_URL);
  let res;
  try {
    res = await fetch(url, { method: "GET" });
  } catch (networkErr) {
    const details = networkErr?.message || "Network request failed.";
    const hint =
      `Failed to reach ${url}. Ensure the backend is running and CORS/base URL are configured. ` +
      `If using a preview, set REACT_APP_BACKEND_BASE_URL to your backend origin (e.g., https://<host>:3001).`;
    const err = new Error(`${details} ${hint}`);
    err.cause = networkErr;
    throw err;
  }
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
    err.url = url;
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

// PUBLIC_INTERFACE
export async function getHealth() {
  /** Ping the backend root path to verify connectivity. Returns JSON or throws an error with details. */
  const url = `${BASE_URL}/`;
  checkMixedContent(BASE_URL);
  try {
    const res = await fetch(url, { method: "GET" });
    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const payload = isJson ? await res.json().catch(() => ({})) : {};
    if (!res.ok) {
      const msg = payload?.message || payload?.error?.message || `Health check failed (${res.status}).`;
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return payload;
  } catch (e) {
    const details = e?.message || "Network error during health check.";
    const hint = `Unable to reach ${url}. Set REACT_APP_BACKEND_BASE_URL to your backend origin (e.g., https://<host>:3001).`;
    const err = new Error(`${details} ${hint}`);
    err.cause = e;
    throw err;
  }
}

// PUBLIC_INTERFACE
export async function getHello() {
  /** Calls GET /api/hello to verify API connectivity over the configured base URL. Returns JSON payload. */
  return getJSON("/api/hello");
}
