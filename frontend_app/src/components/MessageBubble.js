import React from "react";

/**
 * Very small markdown-ish parser to highlight fenced code blocks ```lang ...```.
 * We avoid external dependencies; handles basic cases.
 */
function renderWithCodeBlocks(text) {
  const parts = [];
  const lines = (text || "").split("\n");
  let inCode = false;
  let codeLang = "";
  let codeBuffer = [];

  lines.forEach((line, idx) => {
    const fenceMatch = line.match(/^```(?:(\w+))?\s*$/);
    if (fenceMatch) {
      if (!inCode) {
        // starting a code block
        inCode = true;
        codeLang = fenceMatch[1] || "";
        codeBuffer = [];
      } else {
        // closing code block
        parts.push(
          <pre className="code-block" key={`code-${idx}`}>
            <code data-lang={codeLang}>{codeBuffer.join("\n")}</code>
          </pre>
        );
        inCode = false;
        codeLang = "";
        codeBuffer = [];
      }
    } else if (inCode) {
      codeBuffer.push(line);
    } else {
      parts.push(
        <p className="bubble-text" key={`p-${idx}`}>
          {line}
        </p>
      );
    }
  });

  if (inCode) {
    // Unclosed fence; render remaining as code
    parts.push(
      <pre className="code-block" key="code-unclosed">
        <code data-lang={codeLang}>{codeBuffer.join("\n")}</code>
      </pre>
    );
  }

  return parts;
}

// PUBLIC_INTERFACE
export default function MessageBubble({ role = "assistant", content }) {
  /** Renders a chat bubble styled differently for user and assistant. Supports basic code blocks. */
  const isUser = role === "user";
  const bubbleClass = isUser ? "bubble bubble-user" : "bubble bubble-assistant";
  const label = isUser ? "User message" : "Assistant message";

  return (
    <div className={bubbleClass} role="article" aria-label={label}>
      {renderWithCodeBlocks(content)}
    </div>
  );
}
