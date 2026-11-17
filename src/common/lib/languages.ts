export const LANGUAGES = ["ko", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

// Each language is named in itself: a reader who can't read the current
// page still has to recognize their own language in the switcher.
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

// Takes the whole href, not just the path: search terms (`/search?q=`) and
// CMS ids (`/admin/articles/edit?id=`) live in the query string, and
// dropping them would land the reader on an empty page.
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

// Static HTML knows only the path it was built for, and islands rewrite the
// query string after load (search terms, CMS filters, a new article's id).
// So links marked `data-language-switch` take their href from the address
// bar at the moment they're used.
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
