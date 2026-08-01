"use client";

import { useEffect } from "react";

import { DEFAULT_POSTS_QUERY_RULES } from "@/entities/post";
import { POSTS_FEED_OPTIONS_KEY, parsePostsFeedOptions } from "@/features/posts-options";
import { useLocalStorage } from "@/shared/lib";

import { useAppStoreApi } from "../store/store-provider";

export function PostsOptionsPersistence() {
  const store = useAppStoreApi();
  const { isHydrated, read, subscribe, write } = useLocalStorage({
    fallback: DEFAULT_POSTS_QUERY_RULES,
    key: POSTS_FEED_OPTIONS_KEY,
    parse: parsePostsFeedOptions,
  });

  useEffect(() => {
    if (!isHydrated) return;
    store.getState().hydrateRules(read());
    write(store.getState().rules);
    let previous = store.getState().rules;
    const unsubscribeStore = store.subscribe((state) => {
      if (state.rules === previous) return;
      previous = state.rules;
      write(state.rules);
    });
    const unsubscribeStorage = subscribe((rules) => {
      store.getState().setRules(rules);
    });
    return () => {
      unsubscribeStore();
      unsubscribeStorage();
    };
  }, [isHydrated, read, store, subscribe, write]);

  return null;
}
