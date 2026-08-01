"use client";

import type { RefObject } from "react";

import type { CurrentUser } from "@/entities/session";
import { LoginForm } from "@/features/login";
import type { RestClient } from "@/shared/api";
import { Dialog } from "@/shared/ui/dialog";

interface ModalHostProps {
  client: RestClient;
  loginTriggerRef: RefObject<HTMLButtonElement | null>;
  modal: "login" | null;
  onAuthenticated: (
    accessToken: string,
    currentUser: CurrentUser,
  ) => void;
  onClose: () => void;
}

export function ModalHost({
  client,
  loginTriggerRef,
  modal,
  onAuthenticated,
  onClose,
}: ModalHostProps) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open={modal === "login"}
      returnFocusRef={loginTriggerRef}
      title="Вход"
    >
      <LoginForm
        client={client}
        onAuthenticated={onAuthenticated}
        onSuccess={onClose}
      />
    </Dialog>
  );
}
