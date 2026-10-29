// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";

const { PUBLIC_API_BASE_URL } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);

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
    // Browser islands call `/api` in dev to avoid CORS (see common/lib/api.ts).
    server: {
      proxy: {
        "/api": {
          target: PUBLIC_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  },
});
