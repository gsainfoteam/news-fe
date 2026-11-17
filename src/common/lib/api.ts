import { API_BASE_URL } from "astro:env/client";

// SSR can't fetch a relative URL, so only the dev browser uses the proxy.
// The login SDK sends its session requests here too: the refresh cookie is
// `SameSite=Strict`, so in dev it only flows through the same-origin proxy.
export const API_URL =
  import.meta.env.DEV && !import.meta.env.SSR ? "/api" : API_BASE_URL;

// Typed generically instead of with the generated `CreateClientConfig` so this
// file still type-checks before `bun run gen:api` has run.
export const createClientConfig = <T>(config: T) => ({
  ...config,
  baseUrl: API_URL,
  credentials: "include" as const,
});
