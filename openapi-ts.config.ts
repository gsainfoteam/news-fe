import { defineConfig } from "@hey-api/openapi-ts";

const {
  SWAGGER_URL = "https://api.stg.news.gistory.me/api-json",
  SWAGGER_USER,
  SWAGGER_PASSWORD,
} = process.env;

if (!SWAGGER_USER || !SWAGGER_PASSWORD) {
  throw new Error("SWAGGER_USER and SWAGGER_PASSWORD must be set in .env");
}

export default defineConfig({
  input: {
    path: SWAGGER_URL,
    fetch: {
      headers: {
        Authorization: `Basic ${btoa(`${SWAGGER_USER}:${SWAGGER_PASSWORD}`)}`,
      },
    },
  },
  output: "src/@types/api",
  parser: {
    patch: {
      // news-be leaves error responses without a body schema; attach ErrorDto
      // so the client types errors.
      input: (spec) => {
        if (!("components" in spec)) return;
        for (const pathItem of Object.values(spec.paths ?? {})) {
          for (const operation of Object.values(pathItem ?? {})) {
            if (
              !operation ||
              typeof operation !== "object" ||
              !("responses" in operation)
            )
              continue;
            for (const [status, response] of Object.entries(
              operation.responses ?? {},
            )) {
              if (Number.parseInt(status) < 400) continue;
              if ("$ref" in response || response.content) continue;
              response.content = {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorDto" },
                },
              };
            }
          }
        }
        spec.components ??= {};
        spec.components.schemas ??= {};
        spec.components.schemas.ErrorDto = {
          type: "object",
          properties: {
            message: { type: "string" },
            error: { type: "string" },
            statusCode: { type: "number" },
          },
          required: ["message", "error", "statusCode"],
        };
      },
      schemas: {
        // news-be counts articles with raw `count(*)`, so Postgres' bigint
        // arrives as a string. Accept both until the backend returns a number,
        // otherwise response validation fails every article list.
        ArticleListDto: (schema) => {
          if ("properties" in schema && schema.properties) {
            schema.properties.count = {
              anyOf: [{ type: "number" }, { type: "string" }],
            };
          }
        },
      },
    },
  },
  plugins: [
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./src/common/lib/api",
    },
    {
      name: "@hey-api/sdk",
      transformer: true,
      // Responses that drift from the spec come back as `error`; build-time
      // callers pass `throwOnError: true` so a drift fails the build.
      validator: { response: "zod" },
    },
    "@hey-api/transformers",
    "zod",
    "@tanstack/react-query",
    // shortcut: handlers have no default data, so stories pass bodies by hand.
    // The faker plugin (0.99.0) would fill them but emits date strings typed
    // as `Date` under transformers and fails type-checking; revisit on upgrade.
    "msw",
  ],
});
