import { useState, useCallback } from "react";

const STORAGE_KEY = "rice_chat_history";
const MAX_MESSAGES = 100; // cap storage size

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToBrowser(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Storage quota exceeded — fail silently
  }
}


export function useChatHistory(defaultGreeting) {
  const saved = loadSaved();

  const initial = saved && saved.length > 0
    ? saved
    : [{ role: "bot", text: defaultGreeting }];

  const [messages, setMessages]   = useState(initial);
  const [isRestored, setIsRestored] = useState(!!(saved && saved.length > 0));

  const addMessage = useCallback((msg) => {
    setMessages((prev) => {
      const next = [...prev, msg].slice(-MAX_MESSAGES);
      saveToBrowser(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback((greeting) => {
    const reset = [{ role: "bot", text: greeting }];
    setMessages(reset);
    setIsRestored(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { messages, isRestored, addMessage, clearHistory };
}
