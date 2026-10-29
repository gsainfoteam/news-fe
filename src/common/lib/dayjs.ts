import dayjs, { type ConfigType } from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useTranslation } from "react-i18next";

import { i18n } from "./i18n";

// Static import: with a dynamic import, islands on ko pages still formatted
// dates in English (checked in the built site).
import "dayjs/locale/ko";

dayjs.extend(localizedFormat);

// Keep dayjs's locale in sync with the active i18next language.
i18n.on("languageChanged", (lng) => dayjs.locale(lng));
dayjs.locale(i18n.language);

// The global locale follows the shared instance, which stays "ko" during the
// build, so static views take the per-page instance's language instead. Until
// an island's translations load, t() returns the ko defaults the build wrote;
// dates match them, or hydration sees different text.
export function useDayjs() {
  const { i18n: i18nInstance, ready } = useTranslation();
  const lng = ready ? i18nInstance.language : "ko";
  return (date?: ConfigType) => dayjs(date).locale(lng);
}

export { dayjs };
