import { useState, useRef, useEffect } from "react";
import { useI18n } from "../i18n";
import { useChatHistory } from "../hooks/useChatHistory";

export default function Chatbot() {
  const { t } = useI18n();
  const greeting = t("chatbot.botGreeting");

  const { messages, isRestored, addMessage, clearHistory } = useChatHistory(greeting);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Original sendMessage logic preserved exactly
  const sendMessage = () => {
    if (!input.trim()) return;
    addMessage({ role: "user", text: input });
    setInput("");
    setTimeout(() => {
      addMessage({ role: "bot", text: t("chatbot.aiResponse") });
    }, 500);
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
                  {m.text}
                </div>
              ))}
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
              />
              <button
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{ flexShrink: 0, padding: "10px 20px" }}
              >
                {t("chatbot.send")} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
