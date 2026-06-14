import { createContext, useContext, useState, useCallback } from "react";
import en from "./en.json";
import hi from "./hi.json";
import kn from "./kn.json";

const translations = { en, hi, kn };

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("en");

  const t = useCallback(
    (key) => {
      const keys = key.split(".");
      let val = translations[lang];
      for (const k of keys) {
        val = val?.[k];
      }
      return val ?? key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
