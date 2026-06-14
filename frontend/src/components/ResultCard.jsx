import { useEffect, useState } from "react";
import { useI18n } from "../i18n";

const RECOMMENDATIONS = {
  bacterial_leaf_blight:
    "Apply copper-based bactericides. Remove infected plant debris. Use resistant rice varieties and avoid water stagnation.",

  brown_spot:
    "Apply fungicides such as Tricyclazole or Iprodione. Improve field drainage and maintain balanced fertilization.",

  leaf_blast:
    "Apply Tricyclazole or Propiconazole fungicide. Avoid excessive nitrogen fertilizer and maintain proper water management.",

  leaf_scald:
    "Remove infected leaves, improve field sanitation, and avoid excessive plant stress.",

  narrow_brown_spot:
    "Use disease-free seeds, maintain balanced nutrients, and apply appropriate fungicides when necessary.",

  healthy:
    "No disease detected. Continue good agricultural practices and regular monitoring."
};

export default function ResultCard({ result }) {
  const { t } = useI18n();

  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      setBarWidth((result.confidence || 0) * 100);
    }, 100);

    return () => clearTimeout(id);
  }, [result]);

  const pct = ((result.confidence || 0) * 100).toFixed(1);

  const isInvalid =
    !result.is_rice_leaf ||
    result.disease === "NOT A VALID RICE LEAF IMAGE";

  const recommendation =
    RECOMMENDATIONS[result.disease] ||
    "Consult an agricultural expert for detailed diagnosis and treatment recommendations.";

  const getDiseaseLabel = (disease) => {
    if (!disease) return "";

    try {
      return t(`diseases.${disease}`);
    } catch {
      return disease
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  return (
    <div className="anim-fade-up">

      {/* Header */}
      <div className="result-disease-badge">
         {t("detection.disease")}
      </div>

      {/* Disease Name */}
      <h2
        className="result-disease-name"
        style={{
          color: isInvalid ? "#e74c3c" : undefined
        }}
      >
        {isInvalid
          ? t("result.invalidImage")
          : getDiseaseLabel(result.disease)}
      </h2>

      {/* Confidence */}
      <div className="confidence-block">
        <div className="confidence-header">
          <span className="confidence-label">
            {t("detection.confidence")}
          </span>

          <span className="confidence-value">
            {pct}%
          </span>
        </div>

        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{
              width: `${barWidth}%`
            }}
          />
        </div>
      </div>


      {/* Recommendation */}
      {!isInvalid && (
        <div className="recommendation-box">
          <div className="rec-label">
            💡 {t("detection.recommendation")}
          </div>

          <p className="rec-text">
            {recommendation}
          </p>
        </div>
      )}

      {/* Invalid Image Warning */}
      {isInvalid && (
        <div
          className="recommendation-box"
          style={{
            borderLeft: "4px solid #e74c3c"
          }}
        >
          <div className="rec-label">
            {t("result.invalidTitle")}
          </div>

          <p className="rec-text">
            {t("result.invalidMessage")}
          </p>
        </div>
      )}

      <br />

      {/* Top Predictions */}
      {result.top3_predictions?.length > 0 && (
        <div className="recommendation-box">

          <div className="rec-label">
             {t("result.topPredictions")}
          </div>

          {result.top3_predictions.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "8px",
                paddingBottom: "6px"
              }}
            >
              <span>
                {index + 1}. {getDiseaseLabel(item.class)}
              </span>

              <strong>
                {(item.confidence * 100).toFixed(1)}%
              </strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}