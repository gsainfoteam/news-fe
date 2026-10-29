// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

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
