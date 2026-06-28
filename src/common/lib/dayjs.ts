import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import { i18n } from "./i18n";
import { type Language } from "./languages";

dayjs.extend(localizedFormat);

const localeLoaders: Record<Language, () => Promise<unknown>> = {
  ko: () => import("dayjs/locale/ko"),
  en: () => import("dayjs/locale/en"),
};

async function syncDayjsLocale(lng: Language) {
  try {
    const loader = localeLoaders[lng];
    if (!loader) throw new Error(`Unsupported language: ${lng}`);
    await loader();
    dayjs.locale(lng);
  } catch {
    dayjs.locale("en");
  }
}

// Keep dayjs's locale in sync with the active i18next language.
i18n.on("languageChanged", (lng) => syncDayjsLocale(lng as Language));
void syncDayjsLocale(i18n.language as Language);

export { dayjs };
