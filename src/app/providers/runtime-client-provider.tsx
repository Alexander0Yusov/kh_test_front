"use client";

import {
  type ReactNode,
  createContext,
  use,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  type GraphqlClient,
  type RestClient,
  createGraphqlClient,
  createRestClient,
} from "@/shared/api";
import {
  type RuntimeConfig,
  getRuntimeConfig,
} from "@/shared/config";
import { Button } from "@/shared/ui/button";

import { useAppStoreApi } from "../store/store-provider";

interface RuntimeClientContextValue {
  backendUrl: string;
  client: RestClient;
  graphqlClient: GraphqlClient;
}

type RuntimeClientState =
  | { status: "loading" }
  | { message: string; status: "error" }
  | {
      backendUrl: string;
      client: RestClient;
      graphqlClient: GraphqlClient;
      status: "ready";
    };

const RuntimeClientContext =
  createContext<RuntimeClientContextValue | null>(null);

interface RuntimeClientProviderProps {
  children: ReactNode;
}

export function RuntimeClientProvider({
  children,
}: RuntimeClientProviderProps) {
  const store = useAppStoreApi();
  const requestRef = useRef<Promise<RuntimeConfig> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<RuntimeClientState>({
    status: "loading",
  });

  useEffect(() => {
    let active = true;
    requestRef.current ??= getRuntimeConfig();

    void requestRef.current.then(
      (config) => {
        if (!active) {
          return;
        }

        const client = createRestClient({
          backendUrl: config.backendUrl,
          getAccessToken: () => store.getState().accessToken ?? undefined,
        });
        const graphqlClient = createGraphqlClient(config.backendUrl);

        setState({
          backendUrl: config.backendUrl,
          client,
          graphqlClient,
          status: "ready",
        });
      },
      () => {
        if (active) {
          setState({
            message: "Application configuration is unavailable.",
            status: "error",
          });
        }
      },
    );

    return () => {
      active = false;
    };
  }, [attempt, store]);

  if (state.status === "loading") {
    return (
      <main className="app-status" role="status">
        Loading application…
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="app-status">
        <p role="alert">{state.message}</p>
        <Button
          onClick={() => {
            requestRef.current = null;
            setState({ status: "loading" });
            setAttempt((value) => value + 1);
          }}
        >
          Retry
        </Button>
      </main>
    );
  }

  return (
    <RuntimeClientContext.Provider
      value={{
        backendUrl: state.backendUrl,
        client: state.client,
        graphqlClient: state.graphqlClient,
      }}
    >
      {children}
    </RuntimeClientContext.Provider>
  );
}

export function useRuntimeBackendUrl(): string {
  const value = use(RuntimeClientContext);

  if (!value) {
    throw new Error("RuntimeClientProvider is missing.");
  }

  return value.backendUrl;
}

export function useRuntimeClient(): RestClient {
  const value = use(RuntimeClientContext);

  if (!value) {
    throw new Error("RuntimeClientProvider is missing.");
  }

  return value.client;
}

export function useRuntimeGraphqlClient(): GraphqlClient {
  const value = use(RuntimeClientContext);

  if (!value) {
    throw new Error("RuntimeClientProvider is missing.");
  }

  return value.graphqlClient;
}
