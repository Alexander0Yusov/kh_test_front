import {
  type RuntimeConfig,
  RuntimeConfigError,
  validateBackendUrl,
} from "./runtime-config";

function isRuntimeConfig(value: unknown): value is RuntimeConfig {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return "backendUrl" in value && typeof value.backendUrl === "string";
}

export async function getRuntimeConfig(
  signal?: AbortSignal,
): Promise<RuntimeConfig> {
  const response = await fetch("/api/runtime-config", {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new RuntimeConfigError(
      `Runtime configuration request failed with status ${response.status}.`,
    );
  }

  const payload: unknown = await response.json();

  if (!isRuntimeConfig(payload)) {
    throw new RuntimeConfigError("Runtime configuration response is invalid.");
  }

  return {
    backendUrl: validateBackendUrl(payload.backendUrl),
  };
}
