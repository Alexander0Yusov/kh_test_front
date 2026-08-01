"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          error: "app-toast app-toast-error",
          success: "app-toast app-toast-success",
          toast: "app-toast",
        },
      }}
    />
  );
}
