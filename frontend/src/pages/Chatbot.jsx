import { useState, useRef, useEffect } from "react";
import { useI18n } from "../i18n";
import { useChatHistory } from "../hooks/useChatHistory";


const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function Chatbot() {
  const { t } = useI18n();
  const greeting = t("chatbot.botGreeting");

  const { messages, isRestored, addMessage, clearHistory } = useChatHistory(greeting);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Scroll to bottom on every new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    addMessage({ role: "user", text: userText });
    setLoading(true);

    try {

      const historyPayload = messages
        .filter((m) => m.text !== greeting)   
        .slice(-10)                            
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      addMessage({ role: "bot", text: data.reply });
    } catch (err) {
      addMessage({
        role: "bot",
        text: "Could not reach the server. Please make sure the backend is running.",
      });
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="page-header anim-fade-up">
          <h1 className="page-header__title">{t("chatbot.title")}</h1>
          <p className="page-header__sub">{t("chatbot.subtitle")}</p>
        </div>

        <div className="chatbot-layout">
          <div className="card chat-panel anim-fade-up delay-1">

            {/* Chat header with clear button */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px 0",
            }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {isRestored
                  ? ` ${messages.length - 1} message${messages.length !== 2 ? "s" : ""} restored`
                  : " New conversation"}
              </span>
              {messages.length > 1 && (
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: "12px", padding: "4px 12px" }}
                  onClick={() => clearHistory(greeting)}
                  title="Clear chat history"
                >
                  Clear chat
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="chat-messages" role="log" aria-label="Chat messages">
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  {/* Render newlines that come back from the RAG answer */}
                  {m.text.split("\n").map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < m.text.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              ))}

              {/* Typing indicator while waiting for the server */}
              {loading && (
                <div className="msg bot" style={{ opacity: 0.6, fontStyle: "italic" }}>
                  Thinking…
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <input
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("chatbot.placeholder")}
                aria-label={t("chatbot.placeholder")}
                disabled={loading}
              />
              <button
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{ flexShrink: 0, padding: "10px 20px" }}
              >
                {loading ? "…" : `${t("chatbot.send")} →`}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
