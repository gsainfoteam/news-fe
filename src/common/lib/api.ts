import { API_BASE_URL } from "astro:env/client";

export const API_URL =
  import.meta.env.DEV && !import.meta.env.SSR ? "/api" : API_BASE_URL;

// Typed generically instead of with the generated `CreateClientConfig` so this
// file still type-checks before `bun run gen:api` has run.
export const createClientConfig = <T>(config: T) => ({
  ...config,
  baseUrl: API_URL,
  credentials: "include" as const,
});
