import "server-only";

import {
  type RuntimeConfig,
  validateBackendUrl,
} from "./runtime-config";

export function readRuntimeConfig(): RuntimeConfig {
  return {
    backendUrl: validateBackendUrl(process.env.BACKEND_URL),
  };
}
