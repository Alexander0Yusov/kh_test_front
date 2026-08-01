"use client";

import { LoaderCircle } from "lucide-react";
import type { Ref } from "react";

import type { SessionStatus } from "@/entities/session";
import { LogoutButton } from "@/features/logout";
import type { RestClient } from "@/shared/api";
import { Button } from "@/shared/ui/button";

interface AppHeaderProps {
  client: RestClient;
  loginButtonRef: Ref<HTMLButtonElement>;
  onAnonymous: () => void;
  onOpenLogin: () => void;
  status: SessionStatus;
}

export function AppHeader({
  client,
  loginButtonRef,
  onAnonymous,
  onOpenLogin,
  status,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <span className="app-logo">Test Task</span>
      <div className="app-header-actions">
        {status === "authenticated" ? (
          <LogoutButton client={client} onAnonymous={onAnonymous} />
        ) : null}
        {status === "anonymous" || status === "error" ? (
          <Button onClick={onOpenLogin} ref={loginButtonRef}>
            Login
          </Button>
        ) : null}
        {status === "idle" || status === "restoring" ? (
          <Button aria-label="Восстановление сессии" disabled>
            <LoaderCircle
              aria-hidden="true"
              className="progress-icon"
              size={16}
            />
            Session
          </Button>
        ) : null}
      </div>
    </header>
  );
}
