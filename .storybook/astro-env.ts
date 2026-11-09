// Storybook has no Astro runtime, so `astro:env/*` resolves here. MSW handlers
// match any origin, so the value only has to be a valid base URL.
export const PUBLIC_API_BASE_URL = "/api";
export const API_BASE_URL = "/api";
