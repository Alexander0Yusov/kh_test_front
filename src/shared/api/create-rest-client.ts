import createClient, { type Client } from "openapi-fetch";

import type { paths } from "./generated/openapi";
import { validateBackendUrl } from "../config";

export interface CreateRestClientOptions {
  accessToken?: string;
  backendUrl: string;
}

export type RestClient = Client<paths>;

export function createRestClient({
  accessToken,
  backendUrl,
}: CreateRestClientOptions): RestClient {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  return createClient<paths>({
    baseUrl: validateBackendUrl(backendUrl),
    credentials: "include",
    headers,
  });
}
