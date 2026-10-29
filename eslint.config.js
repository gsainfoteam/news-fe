import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import boundaries from "eslint-plugin-boundaries";
import checkFile from "eslint-plugin-check-file";
import importX from "eslint-plugin-import-x";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Architecture layers for `eslint-plugin-boundaries`.
 *
 * `feature-*` elements capture the feature name so rules can restrict
 * cross-layer access to the *same* feature, while still allowing other
 * features to be reached through their public `index.ts` (`feature-index`).
 */
const boundariesElements = [
  { type: "pages", pattern: "src/pages/**", mode: "full" },
  { type: "layouts", pattern: "src/layouts/**", mode: "full" },
  { type: "common-ui", pattern: "src/common/components/ui/**", mode: "full" },
  {
    type: "common-layout",
    pattern: "src/common/components/layout/**",
    mode: "full",
  },
  { type: "common-lib", pattern: "src/common/lib/**", mode: "full" },
  { type: "common-utils", pattern: "src/common/utils/**", mode: "full" },
  { type: "common-const", pattern: "src/common/const/**", mode: "full" },
  // hey-api output (`bun run gen:api`); only feature models may import it.
  { type: "api-gen", pattern: "src/@types/api/**", mode: "full" },
  {
    type: "feature-index",
    pattern: "src/features/*/index.ts",
    mode: "full",
    capture: ["feature"],
  },
  {
    type: "feature-model",
    pattern: "src/features/*/models/**",
    mode: "full",
    capture: ["feature"],
  },
  {
    type: "feature-viewmodel",
    pattern: "src/features/*/viewmodels/**",
    mode: "full",
    capture: ["feature"],
  },
  {
    type: "feature-view",
    pattern: "src/features/*/views/**",
    mode: "full",
    capture: ["feature"],
  },
];

export default defineConfig([
  globalIgnores([
    "dist/**",
    ".astro/**",
    "node_modules/**",
    "storybook-static/**",
    "src/@types/**",
  ]),

  // Base JS/TS recommended rules
  js.configs.recommended,
  tseslint.configs.recommended,

  // Astro recommended (sets the astro-eslint-parser for `.astro`)
  eslintPluginAstro.configs.recommended,

  // Project-wide language options
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // Architecture + import rules (TS, TSX and Astro frontmatter)
  {
    files: ["src/**/*.{ts,tsx,astro}"],
    plugins: {
      boundaries,
      "check-file": checkFile,
      "import-x": importX,
    },
    settings: {
      "import-x/resolver": { typescript: true, node: true },
      "import/resolver": { typescript: true, node: true },
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": boundariesElements,
    },
    rules: {
      // Inline type imports: `import { type Foo } from '...'`
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": "error",
      // Namespace merging is the prescribed pattern for component prop types.
      "@typescript-eslint/no-namespace": "off",

      // Import hygiene + ordering
      "import-x/no-duplicates": "error",
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "type",
          ],
          pathGroups: [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "react-dom", group: "external", position: "before" },
            { pattern: "react-dom/**", group: "external", position: "before" },
            { pattern: "@/**", group: "internal" },
          ],
          pathGroupsExcludedImportTypes: ["react", "react-dom"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // kebab-case files and folders (src/pages is exempt — Astro routing)
      "check-file/filename-naming-convention": [
        "error",
        { "src/{common,features,layouts}/**/*.{ts,tsx,astro}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": [
        "error",
        { "src/{common,features}/**/": "KEBAB_CASE" },
      ],

      // Layer access rules (View -> ViewModel -> Model)
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: { type: "pages" },
              allow: [
                {
                  to: {
                    type: [
                      "pages",
                      "layouts",
                      "feature-index",
                      "common-ui",
                      "common-layout",
                      "common-lib",
                      "common-utils",
                      "common-const",
                    ],
                  },
                },
              ],
            },
            {
              from: { type: "layouts" },
              allow: [
                {
                  to: {
                    type: [
                      "layouts",
                      "feature-index",
                      "common-layout",
                      "common-ui",
                      "common-lib",
                      "common-utils",
                      "common-const",
                    ],
                  },
                },
              ],
            },
            {
              from: { type: "common-layout" },
              allow: [
                {
                  to: {
                    type: [
                      "common-layout",
                      "common-ui",
                      "common-lib",
                      "common-utils",
                      "common-const",
                      "feature-index",
                    ],
                  },
                },
              ],
            },
            {
              from: { type: "common-ui" },
              allow: [
                {
                  to: {
                    type: [
                      "common-ui",
                      "common-lib",
                      "common-utils",
                      "common-const",
                    ],
                  },
                },
              ],
            },
            {
              from: { type: ["common-lib", "common-utils", "common-const"] },
              allow: [
                {
                  to: { type: ["common-lib", "common-utils", "common-const"] },
                },
              ],
            },
            {
              from: { type: "feature-index" },
              allow: [
                {
                  to: {
                    type: [
                      "feature-view",
                      "feature-viewmodel",
                      "feature-model",
                    ],
                    captured: { feature: "{{from.feature}}" },
                  },
                },
                {
                  to: {
                    type: [
                      "common-ui",
                      "common-lib",
                      "common-utils",
                      "common-const",
                    ],
                  },
                },
              ],
            },
            {
              from: { type: "feature-view" },
              allow: [
                {
                  // Own viewmodel/view + type-only access to own models.
                  to: {
                    type: [
                      "feature-view",
                      "feature-viewmodel",
                      "feature-model",
                    ],
                    captured: { feature: "{{from.feature}}" },
                  },
                },
                {
                  to: {
                    type: [
                      "feature-index",
                      "common-ui",
                      "common-lib",
                      "common-utils",
                      "common-const",
                    ],
                  },
                },
              ],
            },
            {
              from: { type: "feature-viewmodel" },
              allow: [
                {
                  to: {
                    type: ["feature-viewmodel", "feature-model"],
                    captured: { feature: "{{from.feature}}" },
                  },
                },
                {
                  to: {
                    type: [
                      "feature-index",
                      "common-lib",
                      "common-utils",
                      "common-const",
                    ],
                  },
                },
              ],
            },
            {
              from: { type: "feature-model" },
              allow: [
                {
                  to: {
                    type: "feature-model",
                    captured: { feature: "{{from.feature}}" },
                  },
                },
                {
                  to: { type: ["common-lib", "common-utils", "common-const"] },
                },
                { to: { type: "api-gen" } },
              ],
            },
          ],
        },
      ],
    },
  },

  // React hooks rules for React views
  {
    files: ["src/**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Turn off any ESLint rules that would conflict with Prettier — formatting is
  // Prettier's job (run via the editor / `bun run format`), linting is ESLint's.
  prettierConfig,
]);
