// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  i18n: {
    locales: ["ko", "en"],
    defaultLocale: "ko",
    // Pages live only under src/pages/ (ko). The rewrite fallback builds each
    // one again at /en/… with Astro.currentLocale = "en", so no en/ copies.
    routing: { prefixDefaultLocale: false, fallbackType: "rewrite" },
    fallback: { en: "ko" },
  },

  env: {
    schema: {
      // Read only while building pages; never shipped to the browser.
      API_BASE_URL: envField.string({ context: "server", access: "public" }),
      PUBLIC_API_BASE_URL: envField.string({
        context: "client",
        access: "public",
      }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
