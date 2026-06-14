import { useEffect } from "react";

export default function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className="toast">
        <span className="toast-icon">✅</span>
        {message}
      </div>
    </div>
  );
}
