export interface RuntimeConfig {
  backendUrl: string;
}

export class RuntimeConfigError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "RuntimeConfigError";
  }
}

export function validateBackendUrl(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new RuntimeConfigError("BACKEND_URL is not configured.");
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new RuntimeConfigError("BACKEND_URL must be an absolute URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new RuntimeConfigError(
      "BACKEND_URL must use the HTTP or HTTPS protocol.",
    );
  }

  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";

  return url.href.replace(/\/$/, "");
}

export function getBackendOrigin(backendUrl: string): string {
  return new URL(validateBackendUrl(backendUrl)).origin;
}

export function getSwaggerJsonUrl(backendUrl: string): string {
  return `${validateBackendUrl(backendUrl)}/docs-json`;
}

export function getGraphqlUrl(backendUrl: string): string {
  return `${validateBackendUrl(backendUrl)}/graphql`;
}
