"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { RestClient } from "@/shared/api";

import { loadPostCaptcha } from "./load-post-captcha";

type CaptchaState =
  | { status: "loading" }
  | { message: string; status: "error" }
  | { captchaId: string; image: string; status: "ready" };

export interface PostCaptchaController {
  captchaId: string | null;
  image: string | null;
  message: string | null;
  refresh: () => Promise<void>;
  status: CaptchaState["status"];
}

export function usePostCaptcha(client: RestClient): PostCaptchaController {
  const [state, setState] = useState<CaptchaState>({ status: "loading" });
  const requestRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setState({ status: "loading" });

    try {
      const captcha = await loadPostCaptcha(client, controller.signal);
      if (requestRef.current !== controller) return;
      setState({ ...captcha, status: "ready" });
    } catch (reason: unknown) {
      if (reason instanceof Error && reason.name === "AbortError") return;
      if (requestRef.current !== controller) return;
      setState({
        message: "CAPTCHA is unavailable. Please try again.",
        status: "error",
      });
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, [client]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void refresh();
    });
    return () => {
      active = false;
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [refresh]);

  return {
    captchaId: state.status === "ready" ? state.captchaId : null,
    image: state.status === "ready" ? state.image : null,
    message: state.status === "error" ? state.message : null,
    refresh,
    status: state.status,
  };
}
