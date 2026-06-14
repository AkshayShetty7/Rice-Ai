import { useI18n } from "../i18n";

export default function About() {
  const { t } = useI18n();

  const diseases = [
    { key: "1", color: "#c0392b" },
    { key: "2", color: "#e67e22" },
    { key: "3", color: "#8e44ad" },
  ];

  const techs = [
    t("about.tech1"),
    t("about.tech2"),
    t("about.tech3"),
    t("about.tech4"),
  ];

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="page-header anim-fade-up">
          <h1 className="page-header__title">{t("about.title")}</h1>
          <p className="page-header__sub">{t("about.subtitle")}</p>
        </div>

        {/* Mission card - full width */}
        <div className="card anim-fade-up delay-1" style={{ padding: "36px", marginBottom: "24px" }}>
          <div className="about-section-title">
            <div className="about-section-icon">🎯</div>
            {t("about.missionTitle")}
          </div>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.75, maxWidth: "680px" }}>
            {t("about.missionDesc")}
          </p>
        </div>

        <div className="about-grid">
          {/* Diseases card */}
          <div className="card about-card anim-fade-up delay-2">
            <div className="about-section-title">
              <div className="about-section-icon">🦠</div>
              {t("about.diseasesTitle")}
            </div>
            {diseases.map(({ key, color }) => (
              <div key={key} className="disease-item">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ display: "inline-block", width: "10px", height: "10px", background: color, borderRadius: "50%", flexShrink: 0 }} />
                  <span className="disease-name">{t(`about.disease${key}Name`)}</span>
                </div>
                <p className="disease-desc">{t(`about.disease${key}Desc`)}</p>
              </div>
            ))}
          </div>

          {/* Tech stack card */}
          <div className="card about-card anim-fade-up delay-3">
            <div className="about-section-title">
              <div className="about-section-icon">⚙️</div>
              {t("about.techTitle")}
            </div>
            {techs.map((tech) => (
              <div key={tech} className="tech-item">
                <div className="tech-check">✓</div>
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer" style={{ marginTop: "60px" }}>
        <div className="container">
          <p className="footer-tagline">🌿 {t("footer.tagline")}</p>
          <p className="footer-rights">{t("footer.rights")}</p>
        </div>
      </footer>
    </div>
  );
}
