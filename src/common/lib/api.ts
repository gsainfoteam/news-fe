import { API_BASE_URL } from "astro:env/client";

// Typed generically instead of with the generated `CreateClientConfig` so this
// file still type-checks before `bun run gen:api` has run.
export const createClientConfig = <T>(config: T) => ({
  ...config,
  // In `astro dev` the browser goes through the Vite proxy to avoid CORS.
  // Server rendering can't call a relative URL, so it always calls the API.
  baseUrl: import.meta.env.DEV && !import.meta.env.SSR ? "/api" : API_BASE_URL,
  credentials: "include" as const,
});
