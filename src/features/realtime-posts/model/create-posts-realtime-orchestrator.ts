import {
  type PostViewModel,
  type PostsQueryRules,
  type PostsRequestStatus,
  compareRootPosts,
  hasLoadedRootSortBoundary,
  hasRootSortValue,
  mapRestPost,
} from "@/entities/post";
import type {
  PostsCreatedEvent,
  RestClient,
} from "@/shared/api";

interface RealtimePostsSnapshot {
  hasMore: boolean;
  postsById: Record<string, PostViewModel>;
  rootIds: string[];
  rules: PostsQueryRules;
  status: PostsRequestStatus;
}

interface PostsRealtimeOrchestratorOptions {
  client: RestClient;
  getSnapshot: () => RealtimePostsSnapshot;
  onError: () => void;
  onInserted: (kind: "reply" | "root") => void;
  onRootSortUnavailable: () => void;
  onSynchronizationWarning: () => void;
  upsertPost: (post: PostViewModel) => void;
}

export interface PostsRealtimeOrchestrator {
  dispose: () => void;
  flushBuffered: () => void;
  handleCreated: (event: PostsCreatedEvent) => void;
}

function isFeedReady(snapshot: RealtimePostsSnapshot): boolean {
  return snapshot.status === "ready" ||
    snapshot.status === "loadingMore" ||
    (snapshot.status === "error" && snapshot.rootIds.length > 0);
}

function getRootRelevance(
  event: PostsCreatedEvent,
  snapshot: RealtimePostsSnapshot,
): "relevant" | "irrelevant" | "sort-unavailable" {
  if (snapshot.rootIds.length === 0) return "relevant";

  if (!hasLoadedRootSortBoundary(snapshot.postsById, snapshot.rootIds, snapshot.rules)) {
    return "sort-unavailable";
  }
  if (!snapshot.hasMore) return "relevant";

  const boundaryId = snapshot.rootIds.at(-1);
  const boundary = boundaryId ? snapshot.postsById[boundaryId] : undefined;
  const candidate = {
    email: event.email,
    id: event.postId,
    publishDate: event.publishDate,
    userName: event.userName,
  };

  if (
    !boundary ||
    !hasRootSortValue(candidate, snapshot.rules)
  ) {
    return "sort-unavailable";
  }

  return compareRootPosts(candidate, boundary, snapshot.rules) <= 0 ? "relevant" : "irrelevant";
}

export function createPostsRealtimeOrchestrator({
  client,
  getSnapshot,
  onError,
  onInserted,
  onRootSortUnavailable,
  onSynchronizationWarning,
  upsertPost,
}: PostsRealtimeOrchestratorOptions): PostsRealtimeOrchestrator {
  const bufferedEvents = new Map<string, PostsCreatedEvent>();
  const pendingRequests = new Map<string, AbortController>();
  const seenEventIds = new Set<string>();
  let disposed = false;

  const processEvent = async (event: PostsCreatedEvent): Promise<void> => {
    const initial = getSnapshot();
    if (initial.postsById[event.postId] || pendingRequests.has(event.postId)) {
      return;
    }

    const parentId = event.parentId;
    const kind = parentId === null ? "root" : "reply";
    if (parentId !== null) {
      if (!event.rootId || !initial.rootIds.includes(event.rootId)) return;
      if (!initial.postsById[parentId]) {
        onSynchronizationWarning();
        return;
      }
    } else {
      const relevance = getRootRelevance(event, initial);
      if (relevance === "sort-unavailable") {
        onRootSortUnavailable();
        return;
      }
      if (relevance === "irrelevant") return;
    }

    const controller = new AbortController();
    pendingRequests.set(event.postId, controller);

    try {
      const response = await client.GET("/posts/{postId}", {
        params: { path: { postId: event.postId } },
        signal: controller.signal,
      });
      if (!response.data) throw new Error("Post unavailable.");
      if (disposed || controller.signal.aborted) return;

      const current = getSnapshot();
      if (current.postsById[event.postId]) return;
      if (parentId !== null) {
        if (!event.rootId || !current.rootIds.includes(event.rootId)) return;
        if (!current.postsById[parentId]) {
          onSynchronizationWarning();
          return;
        }
      }

      upsertPost(mapRestPost(response.data));
      onInserted(kind);
    } catch (reason: unknown) {
      if (!(reason instanceof Error && reason.name === "AbortError")) {
        onError();
      }
    } finally {
      if (pendingRequests.get(event.postId) === controller) {
        pendingRequests.delete(event.postId);
      }
    }
  };

  const handleCreated = (event: PostsCreatedEvent): void => {
    if (
      disposed ||
      seenEventIds.has(event.postId) ||
      getSnapshot().postsById[event.postId]
    ) return;
    if (!isFeedReady(getSnapshot())) {
      bufferedEvents.set(event.postId, event);
      return;
    }
    seenEventIds.add(event.postId);
    void processEvent(event);
  };

  const flushBuffered = (): void => {
    if (disposed || !isFeedReady(getSnapshot())) return;
    const events = [...bufferedEvents.values()];
    bufferedEvents.clear();
    for (const event of events) handleCreated(event);
  };

  return {
    dispose: () => {
      disposed = true;
      bufferedEvents.clear();
      seenEventIds.clear();
      for (const controller of pendingRequests.values()) controller.abort();
      pendingRequests.clear();
    },
    flushBuffered,
    handleCreated,
  };
}
