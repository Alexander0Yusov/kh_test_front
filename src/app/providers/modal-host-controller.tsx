"use client";

import { ModalHost } from "@/widgets/modal-host";

import { useAppStore } from "../store/store-provider";
import { useLoginTriggerRef } from "./login-trigger-provider";
import { useRegisterTriggerRef } from "./login-trigger-provider";
import { useFilesClient } from "./files-client-provider";
import { useRuntimeClient } from "./runtime-client-provider";

export function ModalHostController() {
  const client = useRuntimeClient();
  const loginTriggerRef = useLoginTriggerRef();
  const registerTriggerRef = useRegisterTriggerRef();
  const filesClient = useFilesClient();
  const closeModal = useAppStore((state) => state.closeModal);
  const modal = useAppStore((state) => state.modal);
  const setAuthenticated = useAppStore(
    (state) => state.setAuthenticated,
  );

  return (
    <ModalHost
      client={client}
      filesClient={filesClient}
      loginTriggerRef={loginTriggerRef}
      modal={modal}
      onAuthenticated={setAuthenticated}
      onClose={closeModal}
      registerTriggerRef={registerTriggerRef}
    />
  );
}
