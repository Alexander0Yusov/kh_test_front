"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  type AttachmentPreviewRequest,
  PostCard,
  type PostFieldSelection,
  type PostInteractionRequest,
  type PostTreeRow,
  type PostsRequestStatus,
} from "@/entities/post";
import { Button } from "@/shared/ui/button";

interface PostsFeedProps {
  error: string | null;
  fields: PostFieldSelection;
  generation: number;
  hasMore: boolean;
  onAttachmentPreview: AttachmentPreviewRequest;
  onLoadMore: () => void;
  onPostInteraction: PostInteractionRequest;
  onRetry: () => void;
  rows: PostTreeRow[];
  status: PostsRequestStatus;
}

export function PostsFeed({ error, fields, generation, hasMore, onAttachmentPreview, onLoadMore, onPostInteraction, onRetry, rows, status }: PostsFeedProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const intentArmedRef = useRef(false);
  const isIntersectingRef = useRef(false);
  const loadLockedRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const touchYRef = useRef<number | null>(null);

  const loadOnePage = useCallback((): void => {
    if (loadLockedRef.current || !hasMore || status !== "ready") return;
    intentArmedRef.current = false;
    loadLockedRef.current = true;
    onLoadMore();
  }, [hasMore, onLoadMore, status]);

  const loadAtBoundary = useCallback((): void => {
    if (!intentArmedRef.current || !isIntersectingRef.current) return;
    loadOnePage();
  }, [loadOnePage]);

  useEffect(() => {
    intentArmedRef.current = false;
    loadLockedRef.current = false;
    isIntersectingRef.current = false;
  }, [generation]);

  useEffect(() => {
    if (status !== "loadingMore") loadLockedRef.current = false;
  }, [status]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      isIntersectingRef.current = entries.some((entry) => entry.isIntersecting);
      loadAtBoundary();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadAtBoundary]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const canvas = sentinel?.closest<HTMLElement>(".app-workspace");
    if (!canvas || !hasMore) return;

    const armIntent = (): void => {
      if (status !== "ready" || loadLockedRef.current) return;
      intentArmedRef.current = true;
      loadAtBoundary();
    };
    const handleWheel = (event: WheelEvent): void => {
      if (event.deltaY > 0) armIntent();
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.target === canvas && ["ArrowDown", "End", "PageDown", " "].includes(event.key)) armIntent();
    };
    const handleScroll = (): void => {
      if (canvas.scrollTop > lastScrollTopRef.current) armIntent();
      lastScrollTopRef.current = canvas.scrollTop;
    };
    const handleTouchStart = (event: TouchEvent): void => {
      touchYRef.current = event.touches[0]?.clientY ?? null;
    };
    const handleTouchMove = (event: TouchEvent): void => {
      const currentY = event.touches[0]?.clientY;
      if (currentY !== undefined && touchYRef.current !== null && currentY < touchYRef.current) armIntent();
      touchYRef.current = currentY ?? null;
    };

    lastScrollTopRef.current = canvas.scrollTop;
    canvas.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("scroll", handleScroll, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      canvas.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("scroll", handleScroll);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [generation, hasMore, loadAtBoundary, status]);

  if (status === "idle" || (status === "loading" && rows.length === 0)) {
    return <p className="feed-state" role="status">Loading messages…</p>;
  }
  if (status === "error" && rows.length === 0) {
    return <div className="feed-state"><p role="alert">{error}</p><Button onClick={onRetry}>Retry</Button></div>;
  }
  if (status === "ready" && rows.length === 0) {
    return <p className="feed-state">No messages yet.</p>;
  }

  return (
    <section aria-label="Public messages" className="posts-feed">
      <div className="post-tree" role="tree">
        {rows.map(({ depth, post }) => (
          <div aria-level={depth + 1} aria-selected="false" className="post-tree-row" key={post.id} role="treeitem" style={{ marginInlineStart: `calc(${depth} * var(--post-tree-indent))` }}>
            <PostCard fields={fields} onAttachmentPreview={onAttachmentPreview} onPostInteraction={onPostInteraction} post={post} />
          </div>
        ))}
      </div>
      {status === "loadingMore" ? <p className="feed-more-state" role="status">Loading more…</p> : null}
      {status === "error" && rows.length > 0 ? (
        <div className="feed-more-state"><p role="alert">{error}</p><Button onClick={onRetry}>Retry next page</Button></div>
      ) : null}
      {hasMore && status === "ready" ? (
        <div className="feed-more-state"><Button onClick={loadOnePage}>Load more</Button></div>
      ) : null}
      <div aria-hidden="true" className="feed-sentinel" ref={sentinelRef} />
    </section>
  );
}
