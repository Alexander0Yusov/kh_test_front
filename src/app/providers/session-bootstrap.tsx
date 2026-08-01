"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  type RestoreSessionResult,
  restoreSession,
} from "@/features/restore-session";
import { Button } from "@/shared/ui/button";

import {
  useAppStore,
  useAppStoreApi,
} from "../store/store-provider";
import { useRuntimeClient } from "./runtime-client-provider";

interface SessionBootstrapProps {
  children: ReactNode;
}

export function SessionBootstrap({
  children,
}: SessionBootstrapProps) {
  const client = useRuntimeClient();
  const store = useAppStoreApi();
  const requestRef =
    useRef<Promise<RestoreSessionResult> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const sessionError = useAppStore((state) => state.sessionError);
  const status = useAppStore((state) => state.status);

  useEffect(() => {
    let active = true;
    store.getState().beginRestore();
    requestRef.current ??= restoreSession(client);

    void requestRef.current.then((result) => {
      if (!active) {
        return;
      }

      const actions = store.getState();

      if (result.status === "authenticated") {
        actions.setAuthenticated(
          result.accessToken,
          result.currentUser,
        );
      } else if (result.status === "anonymous") {
        actions.setAnonymous();
      } else {
        actions.setSessionError(result.message);
      }
    });

    return () => {
      active = false;
    };
  }, [attempt, client, store]);

  return (
    <>
      {status === "error" ? (
        <div className="session-notice" role="status">
          <span>{sessionError}</span>
          <Button
            onClick={() => {
              requestRef.current = null;
              setAttempt((value) => value + 1);
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}
      {children}
    </>
  );
}
