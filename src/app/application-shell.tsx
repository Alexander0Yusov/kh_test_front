"use client";

import { AppHeader } from "@/widgets/app-header";

import { useLoginTriggerRef, useRegisterTriggerRef } from "./providers/login-trigger-provider";
import { PostsFeedController } from "./providers/posts-feed-controller";
import { useRuntimeClient } from "./providers/runtime-client-provider";
import { useAppStore } from "./store/store-provider";

export function ApplicationShell() {
  const client = useRuntimeClient();
  const loginButtonRef = useLoginTriggerRef();
  const registerButtonRef = useRegisterTriggerRef();
  const clearSession = useAppStore((state) => state.clearSession);
  const openLogin = useAppStore((state) => state.openLogin);
  const openRegister = useAppStore((state) => state.openRegister);
  const currentUser = useAppStore((state) => state.currentUser);
  const status = useAppStore((state) => state.status);

  return (
    <div className="app-shell">
      <AppHeader
        client={client}
        currentUser={currentUser}
        loginButtonRef={loginButtonRef}
        onAnonymous={clearSession}
        onOpenLogin={openLogin}
        onOpenRegister={openRegister}
        registerButtonRef={registerButtonRef}
        status={status}
      />
      <main aria-label="Public messages" className="app-workspace">
        <PostsFeedController />
      </main>
    </div>
  );
}
