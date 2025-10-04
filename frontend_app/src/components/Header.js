import React, { useEffect, useState } from "react";
import { getBaseUrl, getHealth, postDebug, postExplain, postGenerate } from "../api";

// PUBLIC_INTERFACE
export default function Header() {
  /** Displays the app title and connection info with subtle shadow using the Executive Gray palette. */
  const base = getBaseUrl();
  const [healthy, setHealthy] = useState(null); // null = unknown, true = ok, false = bad
  const [statusMsg, setStatusMsg] = useState("Checking...");

  // Diagnostics panel state
  const [diagOpen, setDiagOpen] = useState(false);
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagResult, setDiagResult] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getHealth();
        if (!cancelled) {
          setHealthy(true);
          setStatusMsg(data?.message ? `Connected to ${base}` : `Connected`);
        }
      } catch (e) {
        if (!cancelled) {
          setHealthy(false);
          const msg = e?.message || "Connection failed";
          setStatusMsg(msg);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [base]);

  const dotStyle = healthy === null ? { background: "var(--secondary)" } : healthy ? { background: "var(--success)" } : { background: "var(--error)" };

  async function runDiagnostics() {
    setDiagRunning(true);
    setDiagResult("");
    const logs = [];
    const push = (msg) => logs.push(msg);

    push(`Base URL: ${base}`);
    try {
      push("GET / (health) ...");
      const h = await getHealth();
      push(`  OK: ${JSON.stringify(h)}`);
    } catch (e) {
      push(`  ERROR: ${e?.message || String(e)}`);
    }

    try {
      push("POST /generate ...");
      const r = await postGenerate({ prompt: "Say hello", model: undefined });
      push(`  OK: content=${(r?.content || "").slice(0, 60)}... model=${r?.model || "n/a"}`);
    } catch (e) {
      push(`  ERROR: ${e?.message || String(e)}`);
    }

    try {
      push("POST /explain ...");
      const r = await postExplain({ code: "const x = 1;" });
      push(`  OK: content=${(r?.content || "").slice(0, 60)}... model=${r?.model || "n/a"}`);
    } catch (e) {
      push(`  ERROR: ${e?.message || String(e)}`);
    }

    try {
      push("POST /debug ...");
      const r = await postDebug({ code: "function f(){ throw new Error('boom'); } f();" , error: "boom"});
      push(`  OK: content=${(r?.content || "").slice(0, 60)}... model=${r?.model || "n/a"}`);
    } catch (e) {
      push(`  ERROR: ${e?.message || String(e)}`);
    }

    // Note: If OpenAI keys/models are missing on backend, errors should be captured above.

    setDiagResult(logs.join("\n"));
    setDiagRunning(false);
  }

  return (
    <header className="header" role="banner" aria-label="Application Header">
      <div className="header-inner">
        <h1 className="app-title">AI Copilot</h1>
        <div className="connection-meta" aria-live="polite" title={statusMsg}>
          <span className="dot" aria-hidden="true" style={dotStyle} /> {statusMsg}
          <button
            type="button"
            onClick={() => setDiagOpen((v) => !v)}
            style={{
              marginLeft: 10,
              fontSize: 12,
              padding: "2px 6px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "#F3F4F6",
              color: "var(--text)",
              cursor: "pointer"
            }}
            aria-expanded={diagOpen ? "true" : "false"}
            aria-controls="diagnostics-panel"
            title="Open diagnostics"
          >
            Diagnostics
          </button>
        </div>
      </div>
      {diagOpen && (
        <div
          id="diagnostics-panel"
          style={{
            maxWidth: 960,
            margin: "8px auto 0",
            padding: "8px 12px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
        >
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Run end-to-end tests from the browser against the configured backend.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={runDiagnostics}
              disabled={diagRunning}
              style={{
                fontSize: 12,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--primary)",
                color: "white",
                cursor: diagRunning ? "not-allowed" : "pointer"
              }}
            >
              {diagRunning ? "Running..." : "Run Checks"}
            </button>
            <code style={{ fontSize: 12, color: "var(--text)" }}>
              REACT_APP_BACKEND_BASE_URL: {base}
            </code>
          </div>
          {diagResult && (
            <pre className="code-block" style={{ marginTop: 6 }}>
              <code>{diagResult}</code>
            </pre>
          )}
        </div>
      )}
    </header>
  );
}
