"use client";

import type { ReactNode } from "react";

import { AppToaster } from "@/shared/ui/toaster";

import { StoreProvider } from "../store/store-provider";
import { FilesClientProvider } from "./files-client-provider";
import { LoginTriggerProvider } from "./login-trigger-provider";
import { ModalHostController } from "./modal-host-controller";
import { PostsRealtimeController } from "./posts-realtime-controller";
import { RuntimeClientProvider } from "./runtime-client-provider";
import { SessionBootstrap } from "./session-bootstrap";

interface ApplicationProvidersProps {
  children: ReactNode;
}

export function ApplicationProviders({
  children,
}: ApplicationProvidersProps) {
  return (
    <StoreProvider>
      <LoginTriggerProvider>
        <RuntimeClientProvider>
          <FilesClientProvider>
            <PostsRealtimeController />
            <SessionBootstrap>{children}</SessionBootstrap>
            <ModalHostController />
            <AppToaster />
          </FilesClientProvider>
        </RuntimeClientProvider>
      </LoginTriggerProvider>
    </StoreProvider>
  );
}
