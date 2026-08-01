"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PostViewModel } from "@/entities/post";
import type { RestClient } from "@/shared/api";

import { loadPost } from "./load-post";

type PostInteractionState =
  | { cachedPost: PostViewModel | null; status: "loading" }
  | { post: PostViewModel; status: "ready" }
  | { status: "not-found" | "error" };

interface UsePostInteractionOptions {
  client: RestClient;
  initialPost: PostViewModel | null;
  onLoaded: (post: PostViewModel) => void;
  postId: string;
}

export function usePostInteraction({
  client,
  initialPost,
  onLoaded,
  postId,
}: UsePostInteractionOptions) {
  const [state, setState] = useState<PostInteractionState>(() => ({
    cachedPost: initialPost,
    status: "loading",
  }));
  const initialPostRef = useRef(initialPost);
  const requestRef = useRef<AbortController | null>(null);

  const request = useCallback(async (): Promise<void> => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setState({ cachedPost: initialPostRef.current, status: "loading" });

    try {
      const result = await loadPost(client, postId, controller.signal);
      if (requestRef.current !== controller) return;
      if (result.status === "ready") {
        onLoaded(result.post);
        setState(result);
      } else {
        setState(result);
      }
    } catch (reason: unknown) {
      if (!(reason instanceof Error && reason.name === "AbortError")) {
        if (requestRef.current === controller) setState({ status: "error" });
      }
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, [client, onLoaded, postId]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void request();
    });
    return () => {
      active = false;
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [request]);

  return { request, state };
}
