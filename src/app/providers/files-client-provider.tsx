"use client";

import { type ReactNode, createContext, use, useEffect, useState } from "react";

import { FilesSocketClient } from "@/shared/api";

import { useRuntimeBackendUrl } from "./runtime-client-provider";

const FilesClientContext = createContext<FilesSocketClient | null>(null);

export function FilesClientProvider({ children }: { children: ReactNode }) {
  const backendUrl = useRuntimeBackendUrl();
  const [client] = useState(() => new FilesSocketClient(backendUrl));

  useEffect(() => {
    client.connect();
    return () => client.disconnect();
  }, [client]);

  return (
    <FilesClientContext.Provider value={client}>
      {children}
    </FilesClientContext.Provider>
  );
}

export function useFilesClient(): FilesSocketClient {
  const client = use(FilesClientContext);
  if (!client) throw new Error("FilesClientProvider is missing.");
  return client;
}
