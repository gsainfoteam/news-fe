import { PUBLIC_API_BASE_URL } from "astro:env/client";

// astro:env/server throws when bundled for the browser, so only the SSR build
// may load it. The client build replaces `import.meta.env.SSR` with `false`
// and drops the import.
const serverBaseUrl = import.meta.env.SSR
  ? (await import("astro:env/server")).API_BASE_URL
  : undefined;

// Typed generically instead of with the generated `CreateClientConfig` so this
// file still type-checks before `bun run gen:api` has run.
export const createClientConfig = <T>(config: T) => ({
  ...config,
  baseUrl:
    serverBaseUrl ?? (import.meta.env.DEV ? "/api" : PUBLIC_API_BASE_URL),
  credentials: "include" as const,
});
