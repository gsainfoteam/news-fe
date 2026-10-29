import { defineConfig } from "@hey-api/openapi-ts";

const { SWAGGER_URL, SWAGGER_USER, SWAGGER_PASSWORD } = process.env;

if (!SWAGGER_URL || !SWAGGER_USER || !SWAGGER_PASSWORD) {
  throw new Error("SWAGGER_URL, SWAGGER_USER, SWAGGER_PASSWORD must be set");
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
    },
  },
  plugins: [
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./src/common/lib/api",
    },
    { name: "@hey-api/sdk", transformer: true },
    "@hey-api/transformers",
    "zod",
    "@tanstack/react-query",
  ],
});
