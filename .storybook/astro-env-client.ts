// Storybook has no Astro runtime. Views that import a feature's index pull in
// the generated API client, which reads this module through common/lib/api.
export const API_BASE_URL = "/api";
// Stories never reach the IdP: MSW answers the news-be session endpoints.
export const ACCOUNT_ISSUER = "staging";
export const ACCOUNT_CLIENT_ID = "news-storybook";
