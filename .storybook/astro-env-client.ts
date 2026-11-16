// Storybook has no Astro runtime. Views that import a feature's index pull in
// the generated API client, which reads this module through common/lib/api.
export const API_BASE_URL = "/api";
