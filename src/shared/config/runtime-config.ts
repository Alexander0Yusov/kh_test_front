import { z } from "zod";

export interface RuntimeConfig {
  backendUrl: string;
}

export class RuntimeConfigError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "RuntimeConfigError";
  }
}

const backendUrlSchema = z
  .url("BACKEND_URL must be an absolute URL.")
  .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
    message: "BACKEND_URL must use the HTTP or HTTPS protocol.",
  });

export function validateBackendUrl(value: unknown): string {
  const result = backendUrlSchema.safeParse(value);

  if (!result.success) {
    throw new RuntimeConfigError(result.error.issues[0]?.message ?? "BACKEND_URL is invalid.");
  }

  const url = new URL(result.data);
  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";

  return url.href.replace(/\/$/, "");
}

export function getRestApiBaseUrl(backendUrl: string): string {
  return validateBackendUrl(backendUrl);
}

export function getBackendOrigin(backendUrl: string): string {
  return new URL(validateBackendUrl(backendUrl)).origin;
}

export function getFilesSocketUrl(backendUrl: string): string {
  return `${getBackendOrigin(backendUrl)}/files`;
}

export function getPostsSocketUrl(backendUrl: string): string {
  return `${getBackendOrigin(backendUrl)}/posts`;
}

export function getSwaggerJsonUrl(backendUrl: string): string {
  return `${validateBackendUrl(backendUrl)}/docs-json`;
}

export function getGraphqlUrl(backendUrl: string): string {
  return `${validateBackendUrl(backendUrl)}/graphql`;
}
