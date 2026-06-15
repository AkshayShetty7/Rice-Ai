import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../i18n";

export default function Navbar() {
  const { pathname } = useLocation();
  const { lang, setLang, t } = useI18n();

  const links = [
    { path: "/",          label: t("nav.home") },
    { path: "/detection", label: t("nav.detection") },
    { path: "/chatbot",   label: t("nav.chatbot") },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <div className="navbar__icon" aria-hidden="true">🌿</div>
          {t("nav.brand")}
        </Link>

        {/* Nav links */}
        <div className="navbar__links" role="navigation" aria-label="Main navigation">
          {links.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`navbar__link ${pathname === path ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: language selector + mobile menu */}
        <div className="navbar__right">
          <select
            className="lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>

          {/* Mobile hamburger – purely decorative in this iteration */}
          <div className="navbar__mobile-menu" aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </nav>
  );
}
