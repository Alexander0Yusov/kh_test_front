"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import { type PostViewModel, hasLoadedRootSortBoundary } from "@/entities/post";
import { eraseAllData } from "@/features/maintenance";
import { ModalHost } from "@/widgets/modal-host";

import { useAppStore, useAppStoreApi } from "../store/store-provider";
import { useModalReturnFocus } from "./login-trigger-provider";
import { publishApplicationErase } from "./application-reset-notification";
import { useFilesClient } from "./files-client-provider";
import { useRuntimeClient } from "./runtime-client-provider";

export function ModalHostController() {
  const store = useAppStoreApi();
  const client = useRuntimeClient();
  const { returnFocus } = useModalReturnFocus();
  const filesClient = useFilesClient();
  const attachmentPreviewPostId = useAppStore((state) => state.attachmentPreviewPostId);
  const closeModal = useAppStore((state) => state.closeModal);
  const eraseStatus = useAppStore((state) => state.eraseStatus);
  const modal = useAppStore((state) => state.modal);
  const openLogin = useAppStore((state) => state.openLogin);
  const setAuthenticated = useAppStore(
    (state) => state.setAuthenticated,
  );
  const clearSession = useAppStore((state) => state.clearSession);
  const requestFeedReload = useAppStore((state) => state.requestFeedReload);
  const status = useAppStore((state) => state.status);
  const postInteractionPostId = useAppStore((state) => state.postInteractionPostId);
  const attachmentPreviewPost = useAppStore((state) =>
    attachmentPreviewPostId ? state.postsById[attachmentPreviewPostId] ?? null : null,
  );
  const postInteractionPost = useAppStore((state) =>
    postInteractionPostId ? state.postsById[postInteractionPostId] ?? null : null,
  );
  const handleCreatedPost = useCallback((post: PostViewModel): void => {
    const current = store.getState();
    if (current.modal !== "createRootPost" && current.modal !== "postInteraction") return;
    if (
      post.parentId === null &&
      !hasLoadedRootSortBoundary(
        current.postsById,
        current.rootIds,
        current.rules,
      )
    ) {
      current.requestFeedReload();
      return;
    }
    current.upsertPost(post);
  }, [store]);
  const handleEraseAll = useCallback(async (): Promise<void> => {
    if (!store.getState().beginErase()) return;
    try {
      await eraseAllData(client);
      store.getState().resetApplicationData();
      publishApplicationErase();
      toast.success("All project data erased");
    } catch {
      store.getState().setEraseFailed();
      toast.error("Could not erase project data");
    }
  }, [client, store]);

  return (
    <ModalHost
      attachmentPreviewUrl={attachmentPreviewPost?.attachmentUrl ?? null}
      client={client}
      eraseStatus={eraseStatus}
      filesClient={filesClient}
      modal={modal}
      onAuthenticated={setAuthenticated}
      onClose={closeModal}
      onCreatedPost={handleCreatedPost}
      onCreatedWithoutEnrichment={requestFeedReload}
      onEraseAll={() => void handleEraseAll()}
      onUnauthorized={clearSession}
      onOpenLogin={openLogin}
      postInteractionPost={postInteractionPost}
      postInteractionPostId={postInteractionPostId}
      returnFocusRef={returnFocus}
      sessionStatus={status}
    />
  );
}
