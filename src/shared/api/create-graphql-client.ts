import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";

import { getGraphqlUrl } from "@/shared/config";

interface GraphqlErrorExtension {
  code?: string;
  field?: string;
}

export class GraphqlRequestError extends Error {
  public readonly code?: string;
  public readonly field?: string;
  public readonly kind: "graphql" | "http" | "network" | "response";

  public constructor(
    kind: GraphqlRequestError["kind"],
    message: string,
    details?: GraphqlErrorExtension,
  ) {
    super(message);
    this.name = "GraphqlRequestError";
    this.kind = kind;
    this.code = details?.code;
    this.field = details?.field;
  }
}

export interface GraphqlClient {
  request<TResult, TVariables>(
    document: TypedDocumentNode<TResult, TVariables>,
    variables: TVariables,
    signal?: AbortSignal,
  ): Promise<TResult>;
}

interface GraphqlResponse<TResult> {
  data?: TResult;
  errors?: unknown[];
}

function isGraphqlResponse<TResult>(
  value: unknown,
): value is GraphqlResponse<TResult> {
  if (typeof value !== "object" || value === null) return false;
  const errors = Reflect.get(value, "errors");
  return errors === undefined || Array.isArray(errors);
}

function readErrorExtensions(value: unknown): GraphqlErrorExtension {
  if (typeof value !== "object" || value === null) return {};
  const extensions = Reflect.get(value, "extensions");
  if (typeof extensions !== "object" || extensions === null) return {};
  const code = Reflect.get(extensions, "code");
  const field = Reflect.get(extensions, "field");

  return {
    code: typeof code === "string" ? code : undefined,
    field: typeof field === "string" ? field : undefined,
  };
}

export function createGraphqlClient(backendUrl: string): GraphqlClient {
  const endpoint = getGraphqlUrl(backendUrl);

  return {
    async request<TResult, TVariables>(
      document: TypedDocumentNode<TResult, TVariables>,
      variables: TVariables,
      signal?: AbortSignal,
    ): Promise<TResult> {
      let response: Response;

      try {
        response = await fetch(endpoint, {
          body: JSON.stringify({ query: print(document), variables }),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "POST",
          signal,
        });
      } catch (reason: unknown) {
        if (reason instanceof Error && reason.name === "AbortError") {
          throw reason;
        }

        throw new GraphqlRequestError(
          "network",
          "The posts service is unavailable.",
        );
      }

      let payload: unknown;

      try {
        payload = await response.json();
      } catch {
        throw new GraphqlRequestError(
          "response",
          "The posts service returned an invalid response.",
        );
      }

      if (!isGraphqlResponse<TResult>(payload)) {
        throw new GraphqlRequestError(
          "response",
          "The posts service returned an invalid response.",
        );
      }

      const firstError = payload.errors?.[0];

      if (firstError) {
        throw new GraphqlRequestError(
          "graphql",
          "The posts request could not be completed.",
          readErrorExtensions(firstError),
        );
      }

      if (!response.ok) {
        throw new GraphqlRequestError(
          "http",
          "The posts service returned an HTTP error.",
        );
      }

      if (!("data" in payload) || payload.data === undefined) {
        throw new GraphqlRequestError(
          "response",
          "The posts service returned an invalid response.",
        );
      }

      return payload.data;
    },
  };
}
