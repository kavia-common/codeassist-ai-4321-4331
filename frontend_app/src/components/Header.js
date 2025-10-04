import React, { useEffect, useState } from "react";
import { getBaseUrl, getHealth } from "../api";

// PUBLIC_INTERFACE
export default function Header() {
  /** Displays the app title and connection info with subtle shadow using the Executive Gray palette. */
  const base = getBaseUrl();
  const [healthy, setHealthy] = useState(null); // null = unknown, true = ok, false = bad
  const [statusMsg, setStatusMsg] = useState("Checking...");

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

  return (
    <header className="header" role="banner" aria-label="Application Header">
      <div className="header-inner">
        <h1 className="app-title">AI Copilot</h1>
        <div className="connection-meta" aria-live="polite" title={statusMsg}>
          <span className="dot" aria-hidden="true" style={dotStyle} /> {statusMsg}
        </div>
      </div>
    </header>
  );
}
