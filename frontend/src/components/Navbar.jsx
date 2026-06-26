import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useI18n } from "../i18n";

export default function Navbar() {
  const { pathname } = useLocation();
  const { lang, setLang, t } = useI18n();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = [
    { path: "/", label: t("nav.home") },
    { path: "/detection", label: t("nav.detection") },
    { path: "/chatbot", label: t("nav.chatbot") },
    { path: "/about", label: t("nav.about") },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <div className="navbar__icon" aria-hidden="true">
            🌿
          </div>
          {t("nav.brand")}
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar__links">
          {links.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`navbar__link ${
                pathname === path ? "active" : ""
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
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

          {/* Hamburger */}
          <button
            className={`navbar__mobile-menu ${
              menuOpen ? "open" : ""
            }`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`mobile-nav ${
          menuOpen ? "mobile-nav--open" : ""
        }`}
      >
        {links.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`mobile-nav__link ${
              pathname === path ? "active" : ""
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}