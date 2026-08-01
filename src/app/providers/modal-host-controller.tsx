"use client";

import { ModalHost } from "@/widgets/modal-host";

import { useAppStore } from "../store/store-provider";
import { useLoginTriggerRef } from "./login-trigger-provider";
import { useRuntimeClient } from "./runtime-client-provider";

export function ModalHostController() {
  const client = useRuntimeClient();
  const loginTriggerRef = useLoginTriggerRef();
  const closeModal = useAppStore((state) => state.closeModal);
  const modal = useAppStore((state) => state.modal);
  const setAuthenticated = useAppStore(
    (state) => state.setAuthenticated,
  );

  return (
    <ModalHost
      client={client}
      loginTriggerRef={loginTriggerRef}
      modal={modal}
      onAuthenticated={setAuthenticated}
      onClose={closeModal}
    />
  );
}
