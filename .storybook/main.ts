import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { type StorybookConfig } from "@storybook/react-vite";

const srcDir = fileURLToPath(new URL("../src", import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [],
  staticDirs: ["../public"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    const { mergeConfig } = await import("vite");
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: {
        alias: [{ find: /^@\//, replacement: `${srcDir}/` }],
      },
    });
  },
};

export default config;
