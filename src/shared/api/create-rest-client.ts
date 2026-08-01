import createClient, { type Client, type Middleware } from "openapi-fetch";

import type { paths } from "./generated/openapi";
import { getRestApiBaseUrl } from "../config";

export interface CreateRestClientOptions {
  backendUrl: string;
  getAccessToken?: () => string | undefined;
}

export type RestClient = Client<paths>;

export function createRestClient({
  backendUrl,
  getAccessToken,
}: CreateRestClientOptions): RestClient {
  const client = createClient<paths>({
    baseUrl: getRestApiBaseUrl(backendUrl),
    credentials: "include",
  });

  const authenticationMiddleware: Middleware = {
    onRequest({ request }) {
      const accessToken = getAccessToken?.();

      if (accessToken) {
        request.headers.set("Authorization", `Bearer ${accessToken}`);
      }

      return request;
    },
  };

  client.use(authenticationMiddleware);

  return client;
}
