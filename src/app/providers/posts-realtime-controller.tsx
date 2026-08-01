"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createPostsRealtimeOrchestrator } from "@/features/realtime-posts";
import { PostsSocketClient } from "@/shared/api";

import { useAppStoreApi } from "../store/store-provider";
import {
  useRuntimeBackendUrl,
  useRuntimeClient,
} from "./runtime-client-provider";

export function PostsRealtimeController() {
  const backendUrl = useRuntimeBackendUrl();
  const client = useRuntimeClient();
  const store = useAppStoreApi();
  const [socketClient] = useState(() => new PostsSocketClient(backendUrl));

  useEffect(() => {
    const orchestrator = createPostsRealtimeOrchestrator({
      client,
      getSnapshot: () => {
        const state = store.getState();
        return {
          hasMore: state.hasMore,
          postsById: state.postsById,
          rootIds: state.rootIds,
          rules: state.rules,
          status: state.postsStatus,
        };
      },
      onError: () => toast.error("A new message could not be loaded."),
      onInserted: (kind) => {
        toast.success(kind === "root" ? "New message added" : "New reply added");
      },
      onSynchronizationWarning: () => {
        toast.error("A new reply could not be synchronized.");
      },
      upsertPost: (post) => store.getState().upsertPost(post),
    });
    const removeCreatedListener = socketClient.onCreated(
      orchestrator.handleCreated,
    );
    const unsubscribeStore = store.subscribe(() => {
      orchestrator.flushBuffered();
    });

    socketClient.connect();
    orchestrator.flushBuffered();

    return () => {
      removeCreatedListener();
      unsubscribeStore();
      orchestrator.dispose();
      socketClient.disconnect();
    };
  }, [client, socketClient, store]);

  return null;
}
