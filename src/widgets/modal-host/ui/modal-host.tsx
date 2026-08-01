"use client";

import { type RefObject, useEffect, useState } from "react";

import type { PostViewModel } from "@/entities/post";
import type { CurrentUser } from "@/entities/session";
import { AttachmentPreview } from "@/features/attachment-preview";
import { CreatePostForm } from "@/features/create-post";
import { LoginForm } from "@/features/login";
import {
  AttachmentUploadField,
  AvatarUploadField,
  useAttachmentUpload,
  useAvatarUpload,
} from "@/features/file-upload";
import { RegistrationForm } from "@/features/registration";
import { PostInteraction } from "@/features/post-interaction";
import type { FilesSocketClient, RestClient } from "@/shared/api";
import { Dialog } from "@/shared/ui/dialog";

interface ModalHostProps {
  attachmentPreviewUrl: string | null;
  client: RestClient;
  filesClient: FilesSocketClient;
  modal: "attachmentPreview" | "createRootPost" | "login" | "postInteraction" | "register" | null;
  onAuthenticated: (
    accessToken: string,
    currentUser: CurrentUser,
  ) => void;
  onClose: () => void;
  onCreatedPost: (post: PostViewModel) => void;
  onCreatedWithoutEnrichment: () => void;
  onUnauthorized: () => void;
  onOpenLogin: () => void;
  postInteractionPost: PostViewModel | null;
  postInteractionPostId: string | null;
  returnFocusRef: RefObject<HTMLElement | null>;
  sessionStatus: "anonymous" | "authenticated" | "error" | "idle" | "restoring";
}

export function ModalHost({
  attachmentPreviewUrl,
  client,
  filesClient,
  modal,
  onAuthenticated,
  onClose,
  onCreatedPost,
  onCreatedWithoutEnrichment,
  onUnauthorized,
  onOpenLogin,
  postInteractionPost,
  postInteractionPostId,
  returnFocusRef,
  sessionStatus,
}: ModalHostProps) {
  const avatar = useAvatarUpload(client, filesClient);
  const attachment = useAttachmentUpload(client, filesClient);
  const resetAvatar = avatar.reset;
  const resetAttachment = attachment.reset;
  const [registrationBusy, setRegistrationBusy] = useState(false);
  const [createPostBusy, setCreatePostBusy] = useState(false);

  useEffect(() => {
    if (modal !== "register") resetAvatar();
    if (modal !== "createRootPost" && modal !== "postInteraction") resetAttachment();
  }, [modal, resetAttachment, resetAvatar]);

  const title =
    modal === "postInteraction"
      ? "Read & Answer"
      : modal === "attachmentPreview"
      ? "Attachment Preview"
      : modal === "register"
      ? "Регистрация"
      : modal === "createRootPost"
        ? "Create Root Message"
        : "Вход";

  return (
    <Dialog
      closeDisabled={
        (modal === "register" && registrationBusy) ||
        ((modal === "createRootPost" || modal === "postInteraction") && createPostBusy)
      }
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open={modal !== null}
      returnFocusRef={returnFocusRef}
      title={title}
    >
      {modal === "login" ? (
        <LoginForm client={client} onAuthenticated={onAuthenticated} onSuccess={onClose} />
      ) : null}
      {modal === "register" ? (
        <RegistrationForm
          avatarField={<AvatarUploadField controller={avatar} />}
          avatarReady={avatar.file !== null && ["ready", "uploaded", "failed"].includes(avatar.status)}
          client={client}
          onBusyChange={setRegistrationBusy}
          onSuccess={() => {
            avatar.reset();
            onClose();
          }}
          uploadAvatar={avatar.upload}
        />
      ) : null}
      {modal === "createRootPost" ? (
        <CreatePostForm
          attachmentField={<AttachmentUploadField controller={attachment} />}
          client={client}
          isAuthenticated={sessionStatus === "authenticated"}
          onBusyChange={setCreatePostBusy}
          onCreated={onCreatedPost}
          onCreatedWithoutEnrichment={onCreatedWithoutEnrichment}
          onSuccess={() => {
            attachment.reset();
            onClose();
          }}
          onUnauthorized={onUnauthorized}
          uploadAttachment={attachment.upload}
        />
      ) : null}
      {modal === "attachmentPreview" ? (
        <AttachmentPreview attachmentUrl={attachmentPreviewUrl} />
      ) : null}
      {modal === "postInteraction" && postInteractionPostId ? (
        <PostInteraction
          answerForm={
            <CreatePostForm
              attachmentField={<AttachmentUploadField controller={attachment} />}
              client={client}
              isAuthenticated={sessionStatus === "authenticated"}
              onBusyChange={setCreatePostBusy}
              onCreated={onCreatedPost}
              onCreatedWithoutEnrichment={onCreatedWithoutEnrichment}
              onSuccess={() => {
                attachment.reset();
                onClose();
              }}
              onUnauthorized={onUnauthorized}
              parentId={postInteractionPostId}
              uploadAttachment={attachment.upload}
            />
          }
          client={client}
          initialPost={postInteractionPost}
          key={postInteractionPostId}
          onLoaded={onCreatedPost}
          onLogin={onOpenLogin}
          postId={postInteractionPostId}
          sessionStatus={sessionStatus}
        />
      ) : null}
    </Dialog>
  );
}
