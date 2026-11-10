import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { type StorybookConfig } from "@storybook/react-vite";

const srcDir = fileURLToPath(new URL("../src", import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["msw-storybook-addon"],
  // `./public` holds MSW's service worker, kept out of the site's `public/`.
  staticDirs: ["../public", "./public"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    const { mergeConfig } = await import("vite");
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: {
        alias: [
          { find: /^@\//, replacement: `${srcDir}/` },
          {
            // Vite resolves api.ts's `astro:env/server` import even though
            // only the SSR build runs it, so the server module needs the stub too.
            find: /^astro:env\/(client|server)$/,
            replacement: fileURLToPath(
              new URL("./astro-env-client.ts", import.meta.url),
            ),
          },
        ],
      },
    });
  },
};

export default config;
