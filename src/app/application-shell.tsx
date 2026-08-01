"use client";

import { AppHeader } from "@/widgets/app-header";

import { useLoginTriggerRef } from "./providers/login-trigger-provider";
import { useRuntimeClient } from "./providers/runtime-client-provider";
import { useAppStore } from "./store/store-provider";

export function ApplicationShell() {
  const client = useRuntimeClient();
  const loginButtonRef = useLoginTriggerRef();
  const clearSession = useAppStore((state) => state.clearSession);
  const openLogin = useAppStore((state) => state.openLogin);
  const status = useAppStore((state) => state.status);

  return (
    <div className="app-shell">
      <AppHeader
        client={client}
        loginButtonRef={loginButtonRef}
        onAnonymous={clearSession}
        onOpenLogin={openLogin}
        status={status}
      />
      <main aria-label="Рабочая область" className="app-workspace" />
    </div>
  );
}
