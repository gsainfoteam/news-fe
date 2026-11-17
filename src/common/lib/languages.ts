export const LANGUAGES = ["ko", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

// Endonyms: a reader who can't read this page must still find their language.
export const LANGUAGE_NAMES: Record<Language, string> = {
  ko: "한국어",
  en: "English",
};

// Same rule as astro.config.mjs i18n routing (ko unprefixed). React views
// can't import `astro:i18n`: Storybook has no Astro runtime.
export function localizePath(lng: string, path: string) {
  return lng === "ko" ? path : `/${lng}${path}`;
}

const PREFIX = new RegExp(
  `^/(${LANGUAGES.filter((lng) => lng !== "ko").join("|")})(?=/|$)`,
);

export function getPathLanguage(path: string): Language {
  return (PREFIX.exec(path)?.[1] as Language | undefined) ?? "ko";
}

// The /en/ fallback rewrite keeps the prefix in Astro.url.pathname.
export function delocalizePath(path: string) {
  return path.replace(PREFIX, "") || "/";
}

// Keeps the query: search terms and CMS ids live there, not in the path.
export function switchLanguage(href: string, lng: Language) {
  const url = new URL(href, "https://localhost");
  return (
    localizePath(lng, delocalizePath(url.pathname)) + url.search + url.hash
  );
}

export function getLanguageSwitch(current: string, href: string) {
  const lng: Language = current === "en" ? "ko" : "en";
  return { lng, name: LANGUAGE_NAMES[lng], href: switchLanguage(href, lng) };
}

// Static HTML knows only its build path, and islands change the query after
// load, so the href is read from the address bar when the link is used.
export function bindLanguageSwitch() {
  const update = (event: Event) => {
    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>(
      "a[data-language-switch]",
    );
    const lng = link?.dataset.languageSwitch as Language | undefined;
    if (link && lng) link.href = switchLanguage(location.href, lng);
  };
  for (const type of [
    "pointerover",
    "focusin",
    "click",
    "auxclick",
    "contextmenu",
  ]) {
    document.addEventListener(type, update, { capture: true });
  }
}
