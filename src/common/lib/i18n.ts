import i18n, { type Resource, type ResourceLanguage } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next, useTranslation } from "react-i18next";

import { LANGUAGES, type Language } from "./languages";

export function useLanguage(): Language {
  const { i18n: i18nInstance } = useTranslation();
  return i18nInstance.language as Language;
}

// The build bundles every locale so static pages render real text. The
// browser keeps loading /locales over HTTP; this SSR-only branch is dropped.
const resources: Resource | undefined = import.meta.env.SSR
  ? Object.entries(
      import.meta.glob<ResourceLanguage>("../../../public/locales/*/*.json", {
        eager: true,
        import: "default",
      }),
    ).reduce<Resource>((acc, [path, json]) => {
      const [, lng, ns] = path.match(/([^/]+)\/([^/]+)\.json$/)!;
      (acc[lng] ??= {})[ns] = json;
      return acc;
    }, {})
  : undefined;

void (import.meta.env.SSR ? i18n : i18n.use(HttpBackend).use(LanguageDetector))
  .use(initReactI18next)
  .init({
    resources,
    lng: import.meta.env.SSR ? "ko" : undefined,
    supportedLngs: LANGUAGES,
    fallbackLng: "ko",
    ns: ["_"],
    defaultNS: "_",
    nsSeparator: ":",
    keySeparator: ".",
    // gen:i18n extracts untranslated keys as "": fall back to ko, not blank.
    returnEmptyString: false,
    // The URL decides the language; the layout writes it to <html lang>.
    detection: {
      order: ["htmlTag"],
      caches: [],
    },
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

// Build only. Each page gets its own instance instead of flipping the shared
// language, which would leak between pages rendered together. Synchronous
// because `resources` is bundled. Hand it to React Views via I18nextProvider.
export function getPageI18n(locale: string | undefined) {
  return i18n.cloneInstance({ lng: locale ?? "ko" });
}

export { i18n };
