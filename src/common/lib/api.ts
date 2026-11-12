import { API_BASE_URL } from "astro:env/client";

// Typed generically instead of with the generated `CreateClientConfig` so this
// file still type-checks before `bun run gen:api` has run.
export const createClientConfig = <T>(config: T) => ({
  ...config,
  // SSR can't fetch a relative URL, so only the dev browser uses the proxy.
  baseUrl: import.meta.env.DEV && !import.meta.env.SSR ? "/api" : API_BASE_URL,
  credentials: "include" as const,
});
