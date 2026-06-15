
import { useState } from "react";
import ImageUpload from "../components/ImageUpload";
import ResultCard from "../components/ResultCard";
import Toast from "../components/Toast";
import { useDetectionState } from "../hooks/useDetectionState";
import { useI18n } from "../i18n";

export default function Detection() {
  const { t } = useI18n();
  const [toast, setToast] = useState(false);

  const {
    file,
    preview,
    result,
    loading,
    isRestored,
    setImageFile,
    setResult,
    setLoading,
    clearState,
  } = useDetectionState();

  const analyzeImage = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("file", file);

      const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

      const response = await fetch(
        `${API_BASE}/predict`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();

      setResult(data);
      setToast(true);

    } catch (error) {
      console.error("Prediction Error:", error);
      alert("Failed to analyze image. Make sure FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = !!file && !loading;
  const hasPreview = !!preview;

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div className="page-header anim-fade-up">
          <h1 className="page-header__title">
            {t("detection.title")}
          </h1>
          <p className="page-header__sub">
            {t("detection.subtitle")}
          </p>
        </div>

        {/* Restored Session Banner */}
        {isRestored && (
          <div
            className="anim-fade-up"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--green-50)",
              border: "1px solid var(--green-100)",
              borderRadius: "var(--radius-md)",
              padding: "10px 18px",
              marginBottom: "20px",
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            <span>
               Previous session restored. Upload a new image to re-analyse.
            </span>

            <button
              className="btn btn-ghost"
              style={{
                fontSize: "12px",
                padding: "5px 12px",
                marginLeft: "12px",
              }}
              onClick={clearState}
            >
              Clear ✕
            </button>
          </div>
        )}

        <div className="detection-layout">

          {/* Upload Panel */}
          <div className="card upload-panel anim-fade-up delay-1">

            <ImageUpload
              setFile={setImageFile}
              hasFile={hasPreview}
              preview={preview}
              onClear={clearState}
            />

            {/* Analyze Button */}
            <div style={{ marginTop: "20px" }}>
              <button
                className="btn btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "13px",
                }}
                onClick={analyzeImage}
                disabled={!canAnalyze}
              >
                {loading
                  ? ` ${t("detection.analyzingBtn")}`
                  : ` ${t("detection.analyzeBtn")}`}
              </button>

              {isRestored && !file && (
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "12px",
                    color: "var(--text-faint)",
                    marginTop: "8px",
                  }}
                >
                  Upload a new image above to enable analysis
                </p>
              )}
            </div>

            {/* Clear Button */}
            {(hasPreview || result) && (
              <div style={{ marginTop: "12px" }}>
                <button
                  className="btn btn-outline"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    fontSize: "13px",
                    padding: "9px",
                  }}
                  onClick={clearState}
                >
                  Clear Saved Prediction
                </button>
              </div>
            )}

            {/* Tips */}
            <div
              className="tips-box"
              style={{ marginTop: "20px" }}
            >
              <div className="tips-title">
                 {t("detection.tips")}
              </div>

              {[
                t("detection.tip1"),
                t("detection.tip2"),
                t("detection.tip3"),
                t("detection.tip4"),
              ].map((tip, i) => (
                <div key={i} className="tip-item">
                  <div className="tip-dot" />
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Results Panel */}
          <div className="card result-panel anim-fade-up delay-2">

            <h2
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "20px",
              }}
            >
               {t("detection.resultsTitle")}
            </h2>

            {!result && !loading && (
              <div className="result-placeholder">
                <div className="result-placeholder-icon">
                  🍃
                </div>

                <p className="result-placeholder-text">
                  Upload a rice leaf image and press Analyze
                  to see the AI diagnosis here.
                </p>
              </div>
            )}

            {loading && (
              <div className="loading-state">
                <div className="spinner" />

                <p className="loading-text">
                  {t("detection.analyzingBtn")}
                </p>

                <div className="loading-bar">
                  <div className="loading-bar-fill" />
                </div>
              </div>
            )}

            {result && !loading && (
              <ResultCard result={result} />
            )}
          </div>
        </div>
      </div>

      <Toast
        message={t("toast.success")}
        show={toast}
        onClose={() => setToast(false)}
      />
    </div>
  );
}

