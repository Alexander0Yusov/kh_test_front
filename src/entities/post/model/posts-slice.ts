import type { StateCreator } from "zustand";

import type {
  PostSortField,
  PublicPostsQuery,
  SortDirection,
} from "@/shared/api/generated/graphql/graphql";

export type PostViewModel = PublicPostsQuery["posts"]["items"][number];

export interface PostFieldSelection {
  attachment: boolean;
  avatar: boolean;
  email: boolean;
  homePage: boolean;
  publishDate: boolean;
}

export interface PostsQueryRules {
  fields: PostFieldSelection;
  limit: number;
  sortBy: PostSortField;
  sortDirection: SortDirection;
}

export interface PostsPage {
  hasMore: boolean;
  items: PostViewModel[];
  nextCursor: string | null;
}

export type PostsRequestStatus =
  | "idle"
  | "loading"
  | "ready"
  | "loadingMore"
  | "error";

interface PostsState {
  postsError: string | null;
  generation: number;
  hasMore: boolean;
  loadingCursor: string | null;
  nextCursor: string | null;
  postsById: Record<string, PostViewModel>;
  rootIds: string[];
  rules: PostsQueryRules;
  postsStatus: PostsRequestStatus;
}

interface PostsActions {
  appendPage: (
    generation: number,
    requestedCursor: string,
    page: PostsPage,
  ) => void;
  beginInitialLoad: () => number;
  beginLoadMore: (cursor: string) => boolean;
  replaceFeed: (generation: number, page: PostsPage) => void;
  resetFeed: () => void;
  setFeedError: (
    generation: number,
    message: string,
    requestedCursor?: string,
  ) => void;
}

export type PostsSlice = PostsActions & PostsState;

const DEFAULT_RULES: PostsQueryRules = {
  fields: {
    attachment: true,
    avatar: true,
    email: true,
    homePage: true,
    publishDate: true,
  },
  limit: 25,
  sortBy: "CREATED_AT",
  sortDirection: "DESC",
};

function mergePosts(
  current: Record<string, PostViewModel>,
  items: PostViewModel[],
): Record<string, PostViewModel> {
  const next = { ...current };

  for (const post of items) {
    next[post.id] = post;
  }

  return next;
}

function appendRootIds(current: string[], items: PostViewModel[]): string[] {
  const seen = new Set(current);
  const next = [...current];

  for (const post of items) {
    if (post.parentId === null && !seen.has(post.id)) {
      seen.add(post.id);
      next.push(post.id);
    }
  }

  return next;
}

export const createPostsSlice: StateCreator<PostsSlice> = (set, get) => ({
  postsError: null,
  generation: 0,
  hasMore: true,
  loadingCursor: null,
  nextCursor: null,
  postsById: {},
  rootIds: [],
  rules: DEFAULT_RULES,
  postsStatus: "idle",
  appendPage: (generation, requestedCursor, page) => {
    const state = get();

    if (
      state.generation !== generation ||
      state.loadingCursor !== requestedCursor
    ) {
      return;
    }

    set({
      postsError: null,
      hasMore: page.hasMore,
      loadingCursor: null,
      nextCursor: page.nextCursor,
      postsById: mergePosts(state.postsById, page.items),
      rootIds: appendRootIds(state.rootIds, page.items),
      postsStatus: "ready",
    });
  },
  beginInitialLoad: () => {
    const generation = get().generation + 1;
    set({
      postsError: null,
      generation,
      hasMore: true,
      loadingCursor: null,
      nextCursor: null,
      postsById: {},
      rootIds: [],
      postsStatus: "loading",
    });
    return generation;
  },
  beginLoadMore: (cursor) => {
    const state = get();

    if (
      state.postsStatus === "loading" ||
      state.postsStatus === "loadingMore" ||
      !state.hasMore ||
      state.nextCursor !== cursor
    ) {
      return false;
    }

    set({ postsError: null, loadingCursor: cursor, postsStatus: "loadingMore" });
    return true;
  },
  replaceFeed: (generation, page) => {
    if (get().generation !== generation) {
      return;
    }

    set({
      postsError: null,
      hasMore: page.hasMore,
      loadingCursor: null,
      nextCursor: page.nextCursor,
      postsById: mergePosts({}, page.items),
      rootIds: appendRootIds([], page.items),
      postsStatus: "ready",
    });
  },
  resetFeed: () => {
    set((state) => ({
      postsError: null,
      generation: state.generation + 1,
      hasMore: true,
      loadingCursor: null,
      nextCursor: null,
      postsById: {},
      rootIds: [],
      postsStatus: "idle",
    }));
  },
  setFeedError: (generation, message, requestedCursor) => {
    const state = get();

    if (
      state.generation !== generation ||
      (requestedCursor !== undefined &&
        state.loadingCursor !== requestedCursor)
    ) {
      return;
    }

    set({
      postsError: message,
      loadingCursor: null,
      postsStatus: "error",
    });
  },
});
