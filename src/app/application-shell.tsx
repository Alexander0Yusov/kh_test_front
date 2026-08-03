"use client";

import { useRef, useState } from "react"; // ← ДОБАВЛЕНО: useState
import { toast } from "sonner"; // ← ДОБАВЛЕНО

import { BackToFeedOrigin } from "@/features/back-to-feed-origin";
import { createPostSeeds } from "@/features/maintenance"; // ← ДОБАВЛЕНО
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

type SeedStatus = "creating" | "failed" | "idle"; // ← ДОБАВЛЕНО

export function ApplicationShell() {
  const workspaceRef = useRef<HTMLElement>(null);
  const feedTopAnchorRef = useRef<HTMLDivElement>(null);
  const [seedStatus, setSeedStatus] = useState<SeedStatus>("idle"); // ← ДОБАВЛЕНО
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
  const feedGeneration = useAppStore((state) => state.generation);
  const modal = useAppStore((state) => state.modal);
  const openEraseAll = useAppStore((state) => state.openEraseAll);
  const requestFeedReload = useAppStore(
    // ← ДОБАВЛЕНО
    (state) => state.requestFeedReload,
  );
  const resetEraseStatus = useAppStore((state) => state.resetEraseStatus);
  const status = useAppStore((state) => state.status);

  // ← ДОБАВЛЕН ВЕСЬ ОБРАБОТЧИК
  const handleCreateSeeds = async (): Promise<void> => {
    if (seedStatus === "creating") {
      return;
    }

    setSeedStatus("creating");

    try {
      const createdCount = await createPostSeeds(client);

      requestFeedReload();
      setSeedStatus("idle");
      toast.success(`Created ${createdCount} seed posts`);
    } catch {
      setSeedStatus("failed");
      toast.error("Could not create seed posts");
    }
  };

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
        onCreateSeeds={() => void handleCreateSeeds()} // ← ДОБАВЛЕНО
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
        seedStatus={seedStatus} // ← ДОБАВЛЕНО
        status={status}
      />
      <main
        aria-label="Public messages"
        className="app-workspace"
        ref={workspaceRef}
        tabIndex={0}
      >
        <div
          aria-label="Top of public messages"
          className="feed-top-anchor"
          ref={feedTopAnchorRef}
          tabIndex={-1}
        />
        <PostsFeedController />
      </main>
      <BackToFeedOrigin
        blocked={modal !== null}
        horizontalOwnerRef={workspaceRef}
        resetKey={feedGeneration}
        topAnchorRef={feedTopAnchorRef}
        verticalOwnerRef={workspaceRef}
      />
      <OptionsSidebarController />
    </div>
  );
}
