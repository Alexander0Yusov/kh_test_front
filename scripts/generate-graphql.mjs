import { generate } from "@graphql-codegen/cli";
import { readFile, writeFile } from "node:fs/promises";

const backendUrl = process.env.BACKEND_URL;

if (!backendUrl) {
  throw new Error("BACKEND_URL is required for GraphQL contract generation.");
}

const parsedBackendUrl = new URL(backendUrl);

if (!["http:", "https:"].includes(parsedBackendUrl.protocol)) {
  throw new Error("BACKEND_URL must be an absolute HTTP or HTTPS URL.");
}

const graphqlUrl = new URL(
  `${parsedBackendUrl.pathname.replace(/\/$/, "")}/graphql`,
  parsedBackendUrl.origin,
).toString();

await generate(
  {
    documents: ["src/shared/api/operations/**/*.graphql"],
    generates: {
      "src/shared/api/generated/graphql/": {
        config: {
          scalars: {
            DateTime: "string",
          },
        },
        preset: "client",
        presetConfig: {
          fragmentMasking: false,
        },
      },
    },
    schema: graphqlUrl,
  },
  true,
);

const generatedTypesPath = "src/shared/api/generated/graphql/graphql.ts";
const generatedTypes = await readFile(generatedTypesPath, "utf8");
const unusedDisableHeader = "/* eslint-disable */\n";

if (generatedTypes.startsWith(unusedDisableHeader)) {
  await writeFile(
    generatedTypesPath,
    generatedTypes.slice(unusedDisableHeader.length),
  );
}
