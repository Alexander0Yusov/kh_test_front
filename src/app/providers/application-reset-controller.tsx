"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useAppStoreApi } from "../store/store-provider";
import { APPLICATION_ERASE_EVENT_KEY } from "./application-reset-notification";
import { useFilesClient } from "./files-client-provider";

export function ApplicationResetController() {
  const filesClient = useFilesClient();
  const store = useAppStoreApi();

  useEffect(() => {
    let resetEpoch = store.getState().resetEpoch;
    const unsubscribe = store.subscribe((state) => {
      if (state.resetEpoch === resetEpoch) return;
      resetEpoch = state.resetEpoch;
      filesClient.cancelPending();
      toast.dismiss();
    });
    const handleStorage = (event: StorageEvent): void => {
      if (event.key !== APPLICATION_ERASE_EVENT_KEY || event.newValue === null) return;
      store.getState().resetApplicationData();
      toast.success("All project data erased");
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, [filesClient, store]);

  return null;
}
