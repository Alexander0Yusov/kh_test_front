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
  preferencesHydrated: boolean;
  reloadToken: number;
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
  hydrateRules: (rules: PostsQueryRules) => void;
  replaceFeed: (generation: number, page: PostsPage) => void;
  resetFeed: () => void;
  requestFeedReload: () => void;
  setFeedError: (
    generation: number,
    message: string,
    requestedCursor?: string,
  ) => void;
  setRules: (rules: PostsQueryRules) => boolean;
  upsertPost: (post: PostViewModel) => void;
}

export type PostsSlice = PostsActions & PostsState;

export const DEFAULT_POSTS_QUERY_RULES: PostsQueryRules = {
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

export function arePostsQueryRulesEqual(
  left: PostsQueryRules,
  right: PostsQueryRules,
): boolean {
  return left.limit === right.limit &&
    left.sortBy === right.sortBy &&
    left.sortDirection === right.sortDirection &&
    left.fields.attachment === right.fields.attachment &&
    left.fields.avatar === right.fields.avatar &&
    left.fields.email === right.fields.email &&
    left.fields.homePage === right.fields.homePage &&
    left.fields.publishDate === right.fields.publishDate;
}

export function hasLoadedRootSortBoundary(
  postsById: Record<string, PostViewModel>,
  rootIds: string[],
  rules: PostsQueryRules,
): boolean {
  const boundaryId = rootIds.at(-1);
  const boundary = boundaryId ? postsById[boundaryId] : undefined;
  return boundary ? hasRootSortValue(boundary, rules) : true;
}

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

export type RootPostSortCandidate = Pick<PostViewModel, "id" | "userName"> &
  Partial<Pick<PostViewModel, "email" | "publishDate">>;

export function hasRootSortValue(
  post: RootPostSortCandidate,
  rules: PostsQueryRules,
): boolean {
  if (rules.sortBy === "EMAIL") return typeof post.email === "string";
  if (rules.sortBy === "CREATED_AT") {
    return typeof post.publishDate === "string" &&
      !Number.isNaN(Date.parse(post.publishDate));
  }
  return post.userName.length > 0;
}

export function compareRootPosts(
  left: RootPostSortCandidate,
  right: RootPostSortCandidate,
  rules: PostsQueryRules,
): number {
  let comparison: number;

  if (rules.sortBy === "EMAIL") {
    comparison = (left.email ?? "").localeCompare(right.email ?? "");
  } else if (rules.sortBy === "USER_NAME") {
    comparison = left.userName.localeCompare(right.userName);
  } else {
    comparison =
      Date.parse(String(left.publishDate ?? "")) -
      Date.parse(String(right.publishDate ?? ""));
    if (Number.isNaN(comparison)) comparison = 0;
  }

  if (comparison === 0) comparison = left.id.localeCompare(right.id);
  return rules.sortDirection === "ASC" ? comparison : -comparison;
}

export const createPostsSlice: StateCreator<PostsSlice> = (set, get) => ({
  postsError: null,
  generation: 0,
  hasMore: true,
  loadingCursor: null,
  nextCursor: null,
  postsById: {},
  preferencesHydrated: false,
  reloadToken: 0,
  rootIds: [],
  rules: DEFAULT_POSTS_QUERY_RULES,
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
  hydrateRules: (rules) => {
    if (get().preferencesHydrated) return;
    set({ preferencesHydrated: true, rules });
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
  requestFeedReload: () => {
    set((state) => ({
      postsError: null,
      generation: state.generation + 1,
      hasMore: true,
      loadingCursor: null,
      nextCursor: null,
      postsById: {},
      reloadToken: state.reloadToken + 1,
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
  setRules: (rules) => {
    const state = get();
    if (arePostsQueryRulesEqual(state.rules, rules)) return false;
    set({
      postsError: null,
      generation: state.generation + 1,
      hasMore: true,
      loadingCursor: null,
      nextCursor: null,
      postsById: {},
      reloadToken: state.reloadToken + 1,
      rootIds: [],
      rules,
      postsStatus: "idle",
    });
    return true;
  },
  upsertPost: (post) => {
    const state = get();
    const postsById = { ...state.postsById, [post.id]: post };
    const rootIds = post.parentId === null && !state.rootIds.includes(post.id)
      ? [...state.rootIds, post.id]
      : [...state.rootIds];

    if (post.parentId === null) {
      rootIds.sort((leftId, rightId) => {
        const left = postsById[leftId];
        const right = postsById[rightId];
        if (!left || !right) return 0;
        return compareRootPosts(left, right, state.rules);
      });
    }

    set({ postsById, rootIds });
  },
});
