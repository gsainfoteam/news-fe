import { mock } from "bun:test";

// Tests run outside Astro, so `astro:env/*` (read by the API client config,
// `src/common/lib/api.ts`) has no runtime. Pure viewmodel tests still reach
// it through feature index files.
const env = { PUBLIC_API_BASE_URL: "/api", API_BASE_URL: "/api" };
mock.module("astro:env/client", () => env);
mock.module("astro:env/server", () => env);
