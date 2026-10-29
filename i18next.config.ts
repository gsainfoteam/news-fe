import { defineConfig } from "i18next-cli";

import { LANGUAGES } from "./src/common/lib/languages";

export default defineConfig({
  locales: [...LANGUAGES],

  extract: {
    input: ["src/**/*.{ts,tsx,astro}"],
    output: "public/locales/{{language}}/{{namespace}}.json",

    defaultNS: "_",
    nsSeparator: ":",
    keySeparator: ".",

    removeUnusedKeys: true,
    sort: true,
    indentation: 2,

    functions: ["t", "*.t"],
    transComponents: ["Trans"],
    useTranslationNames: ["useTranslation"],

    primaryLanguage: "ko",
    secondaryLanguages: ["en"],

    defaultValue: "",

    extractFromComments: true,
  },

  plugins: [
    {
      // SWC can't parse .astro markup; extract from the frontmatter only.
      name: "astro-frontmatter",
      onLoad: (code, path) =>
        path.endsWith(".astro")
          ? (/^---\n([\s\S]*?)\n---/.exec(code)?.[1] ?? "")
          : undefined,
    },
  ],

  lint: {
    ignoredAttributes: ["data-testid", "aria-label"],
    ignoredTags: ["pre", "code"],
    ignore: ["**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  },

  types: {
    input: ["public/locales/ko/*.json"],
    output: "src/@types/i18next.d.ts",
    resourcesFile: "src/@types/resources.d.ts",
    enableSelector: false,
  },
});
