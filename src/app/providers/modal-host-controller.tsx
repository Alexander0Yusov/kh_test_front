"use client";

import { useCallback } from "react";

import { type PostViewModel, hasLoadedRootSortBoundary } from "@/entities/post";
import { ModalHost } from "@/widgets/modal-host";

import { useAppStore, useAppStoreApi } from "../store/store-provider";
import { useModalReturnFocus } from "./login-trigger-provider";
import { useFilesClient } from "./files-client-provider";
import { useRuntimeClient } from "./runtime-client-provider";

export function ModalHostController() {
  const store = useAppStoreApi();
  const client = useRuntimeClient();
  const { returnFocus } = useModalReturnFocus();
  const filesClient = useFilesClient();
  const attachmentPreviewPostId = useAppStore((state) => state.attachmentPreviewPostId);
  const closeModal = useAppStore((state) => state.closeModal);
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

  return (
    <ModalHost
      attachmentPreviewUrl={attachmentPreviewPost?.attachmentUrl ?? null}
      client={client}
      filesClient={filesClient}
      modal={modal}
      onAuthenticated={setAuthenticated}
      onClose={closeModal}
      onCreatedPost={handleCreatedPost}
      onCreatedWithoutEnrichment={requestFeedReload}
      onUnauthorized={clearSession}
      onOpenLogin={openLogin}
      postInteractionPost={postInteractionPost}
      postInteractionPostId={postInteractionPostId}
      returnFocusRef={returnFocus}
      sessionStatus={status}
    />
  );
}
