import React from "react";
import { getBaseUrl } from "../api";

// PUBLIC_INTERFACE
export default function Header() {
  /** Displays the app title and connection info with subtle shadow using the Executive Gray palette. */
  const base = getBaseUrl();
  return (
    <header className="header" role="banner" aria-label="Application Header">
      <div className="header-inner">
        <h1 className="app-title">AI Copilot</h1>
        <div className="connection-meta" aria-live="polite">
          <span className="dot" aria-hidden="true" /> Connected to {base}
        </div>
      </div>
    </header>
  );
}
