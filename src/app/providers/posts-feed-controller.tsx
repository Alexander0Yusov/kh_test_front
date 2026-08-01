"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { buildPostTreeRows } from "@/entities/post";
import { loadPostsPage } from "@/features/load-posts";
import { PostsFeed } from "@/widgets/posts-feed";

import { useAppStore, useAppStoreApi } from "../store/store-provider";
import { useRuntimeGraphqlClient } from "./runtime-client-provider";
import { useModalReturnFocus } from "./login-trigger-provider";

const FEED_ERROR_MESSAGE = "Messages could not be loaded.";

export function PostsFeedController() {
  const client = useRuntimeGraphqlClient();
  const { setReturnFocus } = useModalReturnFocus();
  const store = useAppStoreApi();
  const requestControllerRef = useRef<AbortController | null>(null);
  const error = useAppStore((state) => state.postsError);
  const hasMore = useAppStore((state) => state.hasMore);
  const generation = useAppStore((state) => state.generation);
  const nextCursor = useAppStore((state) => state.nextCursor);
  const preferencesHydrated = useAppStore((state) => state.preferencesHydrated);
  const openAttachmentPreview = useAppStore((state) => state.openAttachmentPreview);
  const openPostInteraction = useAppStore((state) => state.openPostInteraction);
  const postsById = useAppStore((state) => state.postsById);
  const rootIds = useAppStore((state) => state.rootIds);
  const reloadToken = useAppStore((state) => state.reloadToken);
  const rules = useAppStore((state) => state.rules);
  const status = useAppStore((state) => state.postsStatus);
  const rows = useMemo(() => buildPostTreeRows(postsById, rootIds), [postsById, rootIds]);

  const loadInitial = useCallback(async (): Promise<void> => {
    const generation = store.getState().beginInitialLoad();
    const controller = new AbortController();
    requestControllerRef.current?.abort();
    requestControllerRef.current = controller;
    try {
      const page = await loadPostsPage(client, store.getState().rules, null, controller.signal);
      store.getState().replaceFeed(generation, page);
    } catch (reason: unknown) {
      if (!(reason instanceof Error && reason.name === "AbortError")) {
        store.getState().setFeedError(generation, FEED_ERROR_MESSAGE);
      }
    } finally {
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
    }
  }, [client, store]);

  const loadMore = useCallback(async (): Promise<void> => {
    const current = store.getState();
    const cursor = current.nextCursor;
    if (!cursor || !current.beginLoadMore(cursor)) return;
    const generation = store.getState().generation;
    const controller = new AbortController();
    requestControllerRef.current = controller;
    try {
      const page = await loadPostsPage(client, store.getState().rules, cursor, controller.signal);
      store.getState().appendPage(generation, cursor, page);
    } catch (reason: unknown) {
      if (!(reason instanceof Error && reason.name === "AbortError")) {
        store.getState().setFeedError(generation, FEED_ERROR_MESSAGE, cursor);
      }
    } finally {
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
    }
  }, [client, store]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active && store.getState().preferencesHydrated && store.getState().postsStatus === "idle") void loadInitial();
    });
    return () => {
      active = false;
      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
    };
  }, [loadInitial, preferencesHydrated, reloadToken, store]);

  const retry = useCallback(() => {
    if (store.getState().rootIds.length === 0) store.getState().requestFeedReload();
    else void loadMore();
  }, [loadMore, store]);
  const requestLoadMore = useCallback(() => void loadMore(), [loadMore]);

  return <PostsFeed error={error} fields={rules.fields} generation={generation} hasMore={hasMore && nextCursor !== null} onAttachmentPreview={(postId, trigger) => {
    setReturnFocus(trigger);
    openAttachmentPreview(postId);
  }} onLoadMore={requestLoadMore} onPostInteraction={(postId, trigger) => {
    setReturnFocus(trigger);
    openPostInteraction(postId);
  }} onRetry={retry} rows={rows} status={status} />;
}
