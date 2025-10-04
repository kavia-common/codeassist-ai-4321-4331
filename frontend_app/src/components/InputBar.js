import React, { useState } from "react";

/**
 * Modes available for the copilot actions.
 */
const MODES = [
  { value: "generate", label: "Generate" },
  { value: "explain", label: "Explain" },
  { value: "debug", label: "Debug" },
];

// PUBLIC_INTERFACE
export default function InputBar({ onSubmit, disabled = false, defaultMode = "generate" }) {
  /**
   * A fixed input bar with:
   * - Mode selector (Generate/Explain/Debug)
   * - Textarea for input
   * - Submit button
   * Calls onSubmit({ mode, text }) when user submits.
   */
  const [mode, setMode] = useState(defaultMode);
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSubmit?.({ mode, text });
    setText("");
  };

  return (
    <form className="input-bar" onSubmit={handleSubmit} aria-label="Chat input">
      <label htmlFor="mode-select" className="sr-only">
        Mode
      </label>
      <select
        id="mode-select"
        className="mode-select"
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        disabled={disabled}
        aria-disabled={disabled}
        aria-label="Select action mode"
      >
        {MODES.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <label htmlFor="chat-input" className="sr-only">
        Enter your message
      </label>
      <textarea
        id="chat-input"
        className="chat-input"
        placeholder={
          mode === "generate"
            ? "Describe what you want to build..."
            : mode === "explain"
            ? "Paste code you want explained..."
            : "Paste code and optionally include errors..."
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        disabled={disabled}
        aria-disabled={disabled}
      />

      <button
        className="send-btn"
        type="submit"
        disabled={disabled || !text.trim()}
        aria-busy={disabled ? "true" : "false"}
      >
        {disabled ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
