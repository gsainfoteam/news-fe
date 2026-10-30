export const LANGUAGES = ["ko", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

// Same rule as astro.config.mjs i18n routing (ko unprefixed). React views
// can't import `astro:i18n`: Storybook has no Astro runtime.
export function localizePath(lng: string, path: string) {
  return lng === "ko" ? path : `/${lng}${path}`;
}
