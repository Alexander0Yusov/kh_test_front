"use client";

import {
  type ReactNode,
  createContext,
  use,
  useState,
} from "react";
import { useStore } from "zustand";

import {
  type AppStore,
  type AppStoreApi,
  createAppStore,
} from "./app-store";

const StoreContext = createContext<AppStoreApi | null>(null);

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [store] = useState(createAppStore);

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}

export function useAppStoreApi(): AppStoreApi {
  const store = use(StoreContext);

  if (!store) {
    throw new Error("StoreProvider is missing.");
  }

  return store;
}

export function useAppStore<T>(selector: (state: AppStore) => T): T {
  return useStore(useAppStoreApi(), selector);
}
