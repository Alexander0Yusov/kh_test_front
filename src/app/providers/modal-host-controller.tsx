"use client";

import { ModalHost } from "@/widgets/modal-host";

import { useAppStore } from "../store/store-provider";
import { useModalReturnFocus } from "./login-trigger-provider";
import { useFilesClient } from "./files-client-provider";
import { useRuntimeClient } from "./runtime-client-provider";

export function ModalHostController() {
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
  const upsertPost = useAppStore((state) => state.upsertPost);
  const attachmentPreviewPost = useAppStore((state) =>
    attachmentPreviewPostId ? state.postsById[attachmentPreviewPostId] ?? null : null,
  );
  const postInteractionPost = useAppStore((state) =>
    postInteractionPostId ? state.postsById[postInteractionPostId] ?? null : null,
  );

  return (
    <ModalHost
      attachmentPreviewUrl={attachmentPreviewPost?.attachmentUrl ?? null}
      client={client}
      filesClient={filesClient}
      modal={modal}
      onAuthenticated={setAuthenticated}
      onClose={closeModal}
      onCreatedPost={upsertPost}
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
