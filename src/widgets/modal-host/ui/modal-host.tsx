"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

import type { CurrentUser } from "@/entities/session";
import { LoginForm } from "@/features/login";
import { AvatarUploadField, useAvatarUpload } from "@/features/file-upload";
import { RegistrationForm } from "@/features/registration";
import type { FilesSocketClient, RestClient } from "@/shared/api";
import { Dialog } from "@/shared/ui/dialog";

interface ModalHostProps {
  client: RestClient;
  filesClient: FilesSocketClient;
  loginTriggerRef: RefObject<HTMLButtonElement | null>;
  modal: "login" | "register" | null;
  onAuthenticated: (
    accessToken: string,
    currentUser: CurrentUser,
  ) => void;
  onClose: () => void;
  registerTriggerRef: RefObject<HTMLButtonElement | null>;
}

export function ModalHost({
  client,
  filesClient,
  loginTriggerRef,
  modal,
  onAuthenticated,
  onClose,
  registerTriggerRef,
}: ModalHostProps) {
  const avatar = useAvatarUpload(client, filesClient);
  const resetAvatar = avatar.reset;
  const [registrationBusy, setRegistrationBusy] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (modal === "login") returnFocusRef.current = loginTriggerRef.current;
    if (modal === "register") returnFocusRef.current = registerTriggerRef.current;
  }, [loginTriggerRef, modal, registerTriggerRef]);

  useEffect(() => {
    if (modal === null) resetAvatar();
  }, [modal, resetAvatar]);

  return (
    <Dialog
      closeDisabled={modal === "register" && registrationBusy}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open={modal !== null}
      returnFocusRef={returnFocusRef}
      title={modal === "register" ? "Регистрация" : "Вход"}
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
    </Dialog>
  );
}
