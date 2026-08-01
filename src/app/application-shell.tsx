"use client";

import { AppHeader } from "@/widgets/app-header";

import {
  useCreateMessageTriggerRef,
  useEraseAllTriggerRef,
  useLoginTriggerRef,
  useModalReturnFocus,
  useRegisterTriggerRef,
} from "./providers/login-trigger-provider";
import { PostsFeedController } from "./providers/posts-feed-controller";
import { OptionsSidebarController } from "./providers/options-sidebar-controller";
import { useRuntimeClient } from "./providers/runtime-client-provider";
import { useAppStore } from "./store/store-provider";

export function ApplicationShell() {
  const client = useRuntimeClient();
  const loginButtonRef = useLoginTriggerRef();
  const registerButtonRef = useRegisterTriggerRef();
  const createMessageButtonRef = useCreateMessageTriggerRef();
  const eraseAllButtonRef = useEraseAllTriggerRef();
  const { setReturnFocus } = useModalReturnFocus();
  const clearSession = useAppStore((state) => state.clearSession);
  const openLogin = useAppStore((state) => state.openLogin);
  const openCreateRootPost = useAppStore((state) => state.openCreateRootPost);
  const openRegister = useAppStore((state) => state.openRegister);
  const currentUser = useAppStore((state) => state.currentUser);
  const eraseStatus = useAppStore((state) => state.eraseStatus);
  const openEraseAll = useAppStore((state) => state.openEraseAll);
  const resetEraseStatus = useAppStore((state) => state.resetEraseStatus);
  const status = useAppStore((state) => state.status);

  return (
    <div className="app-shell">
      <AppHeader
        client={client}
        createMessageButtonRef={createMessageButtonRef}
        currentUser={currentUser}
        eraseAllButtonRef={eraseAllButtonRef}
        eraseStatus={eraseStatus}
        loginButtonRef={loginButtonRef}
        onAnonymous={clearSession}
        onCreateMessage={() => {
          setReturnFocus(createMessageButtonRef.current);
          if (status === "authenticated") openCreateRootPost();
          else openLogin();
        }}
        onEraseAll={() => {
          setReturnFocus(eraseAllButtonRef.current);
          resetEraseStatus();
          openEraseAll();
        }}
        onOpenLogin={() => {
          setReturnFocus(loginButtonRef.current);
          openLogin();
        }}
        onOpenRegister={() => {
          setReturnFocus(registerButtonRef.current);
          openRegister();
        }}
        registerButtonRef={registerButtonRef}
        status={status}
      />
      <main aria-label="Public messages" className="app-workspace" tabIndex={0}>
        <PostsFeedController />
      </main>
      <OptionsSidebarController />
    </div>
  );
}
