import { useState, useRef } from "react";
import { useI18n } from "../i18n";

export default function ImageUpload({ setFile, hasFile, preview, onClear }) {
  const { t } = useI18n();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    setFile(file);
  };

  const handleChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      {/* Upload zone */}
      {!hasFile && (
        <div
          className={`upload-zone ${dragging ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            aria-label={t("detection.uploadTitle")}
          />
          <div className="upload-icon" aria-hidden="true">🍃</div>
          <p className="upload-title">{t("detection.uploadTitle")}</p>
          <p className="upload-sub">{t("detection.uploadDesc")}</p>
          <p className="upload-hint">{t("detection.uploadHint")}</p>
        </div>
      )}

      {/* Preview */}
      {hasFile && preview && (
        <div className="anim-scale-in">
          <div className="preview-wrapper">
            <img src={preview} alt="Leaf preview" />
            <div className="preview-overlay" aria-hidden="true" />
            <div className="preview-badge">Ready to analyze</div>
          </div>
          <div style={{ marginTop: "12px", textAlign: "center" }}>
            <button
              className="btn btn-ghost"
              onClick={() => {
                if (onClear) onClear();
                else setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              {t("detection.changeImage")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
