import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

export default function Home() {
  const { t } = useI18n();

  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg" aria-hidden="true" />
        <div className="hero__decoration" aria-hidden="true" />
        <div className="container hero__content">

         <div className="hero-topbar">
          <span className="hero-topbar__text blink-text">
          New here? Download a sample rice leaf dataset to explore Rice Leaf AI
        </span>

          <a
            href="/sample_datasets.zip"
            download
            className="hero-topbar__button"
          >
            Download Dataset ▼
          </a>
        </div>

        
          <h1 className="hero__title anim-fade-up delay-1">
            {t("home.title")}<br />
            {t("home.titleHighlight")}
          </h1>

          <p className="hero__subtitle anim-fade-up delay-2">
            {t("home.subtitle")}
          </p>

          <div className="hero__actions anim-fade-up delay-3">
            <Link to="/detection" className="btn btn-primary" style={{ fontSize: "15px", padding: "12px 28px" }}>
              {t("home.ctaDetect")}
            </Link>
            <Link to="/chatbot" className="btn btn-primary" style={{ fontSize: "15px", padding: "12px 24px" }}>
              {t("home.ctaLearn")} 
            </Link>
          </div>

          {/* Stats */}
          <div className="stats-row anim-fade-up delay-4">
            <div className="stat-item">
              <div className="stat-value">{t("home.stat1Value")}</div>
              <div className="stat-label">{t("home.stat1Label")}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{t("home.stat2Value")}</div>
              <div className="stat-label">{t("home.stat2Label")}</div>
            </div>
         
          </div>
        </div>

      </section>

    
      {/* Footer strip */}
      <footer className="footer">
        <div className="container">
          <p className="footer-tagline">🌿 {t("footer.tagline")}</p>
          <p className="footer-rights">{t("footer.rights")}</p>
        </div>
      </footer>
    </main>
  );
}
