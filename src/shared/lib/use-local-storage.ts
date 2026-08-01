"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

interface UseLocalStorageOptions<T> {
  fallback: T;
  key: string;
  parse: (value: unknown) => T;
}

export function useLocalStorage<T>({ fallback, key, parse }: UseLocalStorageOptions<T>) {
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const read = useCallback((): T => {
    if (typeof window === "undefined") return fallback;
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : parse(JSON.parse(value));
    } catch {
      return fallback;
    }
  }, [fallback, key, parse]);

  const write = useCallback((value: T): void => {
    if (typeof window === "undefined") return;
    try {
      const serialized = JSON.stringify(value);
      if (window.localStorage.getItem(key) !== serialized) {
        window.localStorage.setItem(key, serialized);
      }
    } catch {
      // Storage can be unavailable; preferences remain in memory.
    }
  }, [key]);

  const remove = useCallback((): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage can be unavailable; preferences remain in memory.
    }
  }, [key]);

  const subscribe = useCallback((listener: (value: T) => void): (() => void) => {
    if (typeof window === "undefined") return () => undefined;
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== key) return;
      try {
        listener(event.newValue === null ? fallback : parse(JSON.parse(event.newValue)));
      } catch {
        listener(fallback);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [fallback, key, parse]);

  return useMemo(
    () => ({ isHydrated, read, remove, subscribe, write }),
    [isHydrated, read, remove, subscribe, write],
  );
}
