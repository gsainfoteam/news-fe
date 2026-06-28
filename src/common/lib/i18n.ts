import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next, useTranslation } from "react-i18next";

import { LANGUAGES, type Language } from "./languages";

export function useLanguage(): Language {
  const { i18n: i18nInstance } = useTranslation();
  return i18nInstance.language as Language;
}

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: LANGUAGES,
    fallbackLng: "ko",
    defaultNS: "_",
    nsSeparator: ":",
    keySeparator: ".",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export { i18n };
