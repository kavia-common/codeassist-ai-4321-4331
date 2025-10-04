import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import "./index.css";
import Header from "./components/Header";
import MessageBubble from "./components/MessageBubble";
import InputBar from "./components/InputBar";
import { postDebug, postExplain, postGenerate } from "./api";

// PUBLIC_INTERFACE
function App() {
  /**
   * Main chat UI following Executive Gray theme.
   * Manages messages state and integrates with backend API.
   */
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I’m your AI Copilot. Choose a mode and tell me how I can help." },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const chatRef = useRef(null);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  // PUBLIC_INTERFACE
  const handleSubmit = async ({ mode, text }) => {
    setError("");
    setIsSending(true);

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      let resp;
      if (mode === "generate") {
        resp = await postGenerate({ prompt: text });
      } else if (mode === "explain") {
        resp = await postExplain({ code: text });
      } else {
        // debug
        resp = await postDebug({ code: text });
      }
      const assistantMsg = { role: "assistant", content: resp?.content || "(No content returned)" };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      const msg = e?.message || "Unexpected error occurred.";
      setError(msg);
      const assistantMsg = {
        role: "assistant",
        content: `Sorry, I couldn't process that request.\n\n\`\`\`\n${msg}\n\`\`\``,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const themeClass = useMemo(() => "theme-exec-gray", []);

  return (
    <div className={`app-root ${themeClass}`}>
      <Header />
      <main className="chat-container" role="main" aria-label="Chat conversation">
        <div className="chat-history" ref={chatRef} aria-live="polite">
          {messages.map((m, idx) => (
            <MessageBubble key={idx} role={m.role} content={m.content} />
          ))}
          {isSending && (
            <div className="bubble bubble-assistant typing" aria-label="Assistant is typing">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          )}
        </div>
        {error && (
          <div className="error-banner" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
      </main>
      <InputBar onSubmit={handleSubmit} disabled={isSending} />
    </div>
  );
}

export default App;
