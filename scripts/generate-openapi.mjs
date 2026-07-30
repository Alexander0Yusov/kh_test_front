import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import openapiTS, {
  COMMENT_HEADER,
  astToString,
} from "openapi-typescript";

const outputPath = resolve("src/shared/api/generated/openapi.ts");
const backendUrlValue = process.env.BACKEND_URL;

if (!backendUrlValue) {
  throw new Error("BACKEND_URL is required to generate OpenAPI contracts.");
}

const backendUrl = new URL(backendUrlValue);

if (!["http:", "https:"].includes(backendUrl.protocol)) {
  throw new Error("BACKEND_URL must use the HTTP or HTTPS protocol.");
}

const backendBasePath = backendUrl.pathname.replace(/\/+$/, "");
const swaggerUrl = new URL(
  `${backendBasePath}/docs-json`,
  backendUrl.origin,
);
const response = await fetch(swaggerUrl);

if (!response.ok) {
  throw new Error(
    `Unable to load OpenAPI schema: ${response.status} ${response.statusText}.`,
  );
}

const schema = await response.json();

if (
  typeof schema !== "object" ||
  schema === null ||
  typeof schema.openapi !== "string" ||
  typeof schema.paths !== "object" ||
  schema.paths === null
) {
  throw new Error("Swagger response is not a valid OpenAPI schema.");
}

const relativePaths = {};

for (const [path, pathItem] of Object.entries(schema.paths)) {
  if (!path.startsWith(`${backendBasePath}/`)) {
    throw new Error(
      `OpenAPI path "${path}" is outside BACKEND_URL path "${backendBasePath}".`,
    );
  }

  relativePaths[path.slice(backendBasePath.length)] = pathItem;
}

const normalizedSchema = {
  ...schema,
  paths: relativePaths,
};
const generatedSource = `${COMMENT_HEADER}${astToString(
  await openapiTS(normalizedSchema),
)}`;

await mkdir(dirname(outputPath), { recursive: true });

let currentSource;

try {
  currentSource = await readFile(outputPath, "utf8");
} catch {
  currentSource = undefined;
}

if (currentSource !== generatedSource) {
  await writeFile(outputPath, generatedSource, "utf8");
}

console.log(`Generated OpenAPI contracts from ${swaggerUrl.href}.`);
