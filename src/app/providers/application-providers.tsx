"use client";

import type { ReactNode } from "react";

import { AppToaster } from "@/shared/ui/toaster";

import { StoreProvider } from "../store/store-provider";
import { FilesClientProvider } from "./files-client-provider";
import { ApplicationResetController } from "./application-reset-controller";
import { LoginTriggerProvider } from "./login-trigger-provider";
import { ModalHostController } from "./modal-host-controller";
import { PostsRealtimeController } from "./posts-realtime-controller";
import { PostsOptionsPersistence } from "./posts-options-persistence";
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
      <PostsOptionsPersistence />
      <LoginTriggerProvider>
        <RuntimeClientProvider>
          <FilesClientProvider>
            <ApplicationResetController />
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
