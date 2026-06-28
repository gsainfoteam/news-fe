import createFetchClient from "openapi-fetch";

// Once `bun run gen:api` has generated the schema, type the client with it:
//
//   import { type paths } from "@/@types/api-schema";
//   export const api = createFetchClient<paths>({ ... });

export const api = createFetchClient({
  baseUrl: import.meta.env.DEV ? "/api" : import.meta.env.PUBLIC_API_BASE_URL,
  credentials: "include",
});
