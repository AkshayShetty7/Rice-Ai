import { useI18n } from "../i18n";

export default function About() {
  const { t } = useI18n();

  const diseases = [
    { key: "1", color: "#e74c3c" },
    { key: "2", color: "#d35400" },
    { key: "3", color: "#16a085" },
    { key: "4", color: "#8e44ad" },
    { key: "5", color: "#3498db" },
    { key: "6", color: "#27ae60" },
    { key: "7", color: "#7f8c8d" },
  ];

  const techs = [
    {
      title: t("about.frontendTitle"),
      items: [
        t("about.frontend1"),
        t("about.frontend2"),
        t("about.frontend3"),
      ],
    },
    {
      title: t("about.backendTitle"),
      items: [
        t("about.backend1"),
        t("about.backend2"),
        t("about.backend3"),
      ],
    },
    {
      title: t("about.aiTitle"),
      items: [
        t("about.ai1"),
        t("about.ai2"),
        t("about.ai3"),
        t("about.ai4"),
        t("about.ai5"),
        t("about.ai6"),
      ],
    },
    {
      title: t("about.deployTitle"),
      items: [
        t("about.deploy1"),
        t("about.deploy2"),
      ],
    },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header anim-fade-up">
          <h1 className="page-header__title">{t("about.title")}</h1>
          <p className="page-header__sub">{t("about.subtitle")}</p>
        </div>

        {/* Developer */}
<div
  className="card anim-fade-up delay-1"
  style={{ padding: "36px", marginBottom: "24px" }}
>
  <div className="about-section-title">
    {t("about.developerTitle")}
  </div>

  <div className="developer-profile">
    <div className="developer-avatar">
      AS
    </div>

    <div className="developer-info">
      <h2>Akshay Shetty</h2>

      <p className="developer-role">
        Computer Science & Engineering Student
      </p>

      <p className="developer-role2">
        AI/ML Developer | Generative AI, RAG Systems & Computer Vision
      </p>

      <div className="developer-links">
        <a
          href="https://portfolio-akshayshetty.vercel.app/"
          target="_blank"
          rel="noreferrer"
        >
          Portfolio 
        </a>
    
        <a
          href="https://www.linkedin.com/in/akshay-shetty-25b3a624a/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
  
        <a
          href="https://github.com/AkshayShetty7"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>

        <a
          href="https://github.com/AkshayShetty7/Rice-AI"
          target="_blank"
          rel="noreferrer"
        >
          Repository
        </a>
   
        <a href="mailto:akshayshetty747@gmail.com">
          Email
        </a>
      </div>
    </div>
  </div>
</div>

        <div className="about-grid">
          {/* Diseases */}
          <div className="card about-card anim-fade-up delay-2">
            <div className="about-section-title">
     
              {t("about.diseasesTitle")}
            </div>

            {diseases.map(({ key, color }) => (
              <div key={key} className="disease-item">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: color,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span className="disease-name">
                    {t(`about.disease${key}Name`)}
                  </span>
                </div>

                <p className="disease-desc">
                  {t(`about.disease${key}Desc`)}
                </p>
              </div>
            ))}
          </div>


          {/* Technology */}
          <div className="card about-card anim-fade-up delay-3">
            <div className="about-section-title">
     
              {t("about.techTitle")}
            </div>

            {techs.map((section) => (
              <div key={section.title} style={{ marginBottom: "18px" }}>
                <h4
                  style={{
                    marginBottom: "10px",
                    color: "var(--primary)",
                    fontSize: "15px",
                  }}
                >
                  {section.title}
                </h4>

                {section.items.map((item) => (
                  <div key={item} className="tech-item">
                    <div className="tech-check">•</div>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      

      <footer className="footer" style={{ marginTop: "60px" }}>
        <div className="container">
          <p className="footer-tagline">
            🌿 {t("footer.tagline")}
          </p>
          <p className="footer-rights">
            {t("footer.rights")}
          </p>
        </div>
      </footer>
    </div>

    
  );
}