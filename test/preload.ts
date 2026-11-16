import { mock } from "bun:test";

// The generated API client reads its base URL from astro:env, a virtual module
// that only exists inside Astro. Registering it here, before any test file
// loads, keeps tests that import a feature's models runnable on their own.
mock.module("astro:env/client", () => ({
  API_BASE_URL: "https://api.test",
}));
