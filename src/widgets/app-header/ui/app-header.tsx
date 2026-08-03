"use client";

import { AlertTriangle, LoaderCircle, UserRound } from "lucide-react";
import Image, { type ImageLoaderProps } from "next/image";
import { type Ref, useState } from "react";

import type { CurrentUser, SessionStatus } from "@/entities/session";
import { LogoutButton } from "@/features/logout";
import type { RestClient } from "@/shared/api";
import { Button } from "@/shared/ui/button";

type SeedStatus = "creating" | "failed" | "idle"; // ← ДОБАВЛЕНО

interface AppHeaderProps {
  client: RestClient;
  createMessageButtonRef: Ref<HTMLButtonElement>;
  currentUser: CurrentUser | null;
  eraseAllButtonRef: Ref<HTMLButtonElement>;
  eraseStatus: "erasing" | "failed" | "idle";
  loginButtonRef: Ref<HTMLButtonElement>;
  onAnonymous: () => void;
  onCreateMessage: () => void;
  onCreateSeeds: () => void; // ← ДОБАВЛЕНО
  onEraseAll: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  registerButtonRef: Ref<HTMLButtonElement>;
  seedStatus: SeedStatus; // ← ДОБАВЛЕНО
  status: SessionStatus;
}

export function AppHeader({
  client,
  createMessageButtonRef,
  currentUser,
  eraseAllButtonRef,
  eraseStatus,
  loginButtonRef,
  onAnonymous,
  onCreateMessage,
  onCreateSeeds, // ← ДОБАВЛЕНО
  onEraseAll,
  onOpenLogin,
  onOpenRegister,
  registerButtonRef,
  seedStatus, // ← ДОБАВЛЕНО
  status,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        <span className="app-logo">Test Task</span>
        <Button
          aria-label="Erase all project data"
          disabled={eraseStatus === "erasing"}
          onClick={onEraseAll}
          ref={eraseAllButtonRef}
        >
          <AlertTriangle aria-hidden="true" size={16} /> Erase All
        </Button>
        {/* ← ДОБАВЛЕНА ВСЯ КНОПКА SEEDS */}
        <Button
          aria-label="Create demonstration posts"
          disabled={
            status !== "authenticated" ||
            eraseStatus === "erasing" ||
            seedStatus === "creating"
          }
          onClick={onCreateSeeds}
        >
          {seedStatus === "creating" ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="progress-icon"
                size={16}
              />
              Creating Seeds
            </>
          ) : (
            "Seeds"
          )}
        </Button>
      </div>
      <Button
        disabled={
          eraseStatus === "erasing" ||
          seedStatus === "creating" || // ← ДОБАВЛЕНО
          status === "idle" ||
          status === "restoring"
        }
        onClick={onCreateMessage}
        ref={createMessageButtonRef}
      >
        Create Message
      </Button>
      <div
        className="app-header-actions"
        inert={eraseStatus === "erasing" ? true : undefined}
      >
        <div aria-hidden="true" className="session-indicator">
          {status === "authenticated" && currentUser ? (
            <SessionAvatar
              key={currentUser.avatarUrl}
              url={currentUser.avatarUrl}
            />
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
            Log In
          </Button>
        ) : null}
        {status === "anonymous" || status === "error" ? (
          <Button onClick={onOpenRegister} ref={registerButtonRef}>
            Register
          </Button>
        ) : null}
        {status === "idle" || status === "restoring" ? (
          <Button aria-label="Restoring session" disabled>
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
    <Image
      alt=""
      className="session-avatar"
      height={32}
      loader={passthroughImageLoader}
      onError={() => setFailed(true)}
      src={url}
      unoptimized
      width={32}
    />
  );
}

function passthroughImageLoader({ src }: ImageLoaderProps): string {
  return src;
}
