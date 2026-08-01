"use client";

import { LoaderCircle, UserRound } from "lucide-react";
import Image, { type ImageLoaderProps } from "next/image";
import { type Ref, useState } from "react";

import type { CurrentUser, SessionStatus } from "@/entities/session";
import { LogoutButton } from "@/features/logout";
import type { RestClient } from "@/shared/api";
import { Button } from "@/shared/ui/button";

interface AppHeaderProps {
  client: RestClient;
  createMessageButtonRef: Ref<HTMLButtonElement>;
  currentUser: CurrentUser | null;
  loginButtonRef: Ref<HTMLButtonElement>;
  onAnonymous: () => void;
  onCreateMessage: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  registerButtonRef: Ref<HTMLButtonElement>;
  status: SessionStatus;
}

export function AppHeader({
  client,
  createMessageButtonRef,
  currentUser,
  loginButtonRef,
  onAnonymous,
  onCreateMessage,
  onOpenLogin,
  onOpenRegister,
  registerButtonRef,
  status,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <span className="app-logo">Test Task</span>
      <Button
        disabled={status === "idle" || status === "restoring"}
        onClick={onCreateMessage}
        ref={createMessageButtonRef}
      >
        Create Message
      </Button>
      <div className="app-header-actions">
        <div aria-hidden="true" className="session-indicator">
          {status === "authenticated" && currentUser ? (
            <SessionAvatar key={currentUser.avatarUrl} url={currentUser.avatarUrl} />
          ) : status === "idle" || status === "restoring" ? (
            <LoaderCircle className="progress-icon" size={16} />
          ) : (
            <UserRound size={18} />
          )}
        </div>
        {status === "authenticated" ? (
          <LogoutButton client={client} onAnonymous={onAnonymous} />
        ) : null}
        {status === "anonymous" || status === "error" ? (
          <Button onClick={onOpenLogin} ref={loginButtonRef}>
            Login
          </Button>
        ) : null}
        {status === "anonymous" || status === "error" ? (
          <Button onClick={onOpenRegister} ref={registerButtonRef}>Register</Button>
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

function SessionAvatar({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <UserRound size={18} />
  ) : (
    <Image alt="" className="session-avatar" height={32} loader={passthroughImageLoader} onError={() => setFailed(true)} src={url} unoptimized width={32} />
  );
}

function passthroughImageLoader({ src }: ImageLoaderProps): string {
  return src;
}
