"use client";

import { useEffect, useRef } from "react";

import {
  type AttachmentPreviewRequest,
  PostCard,
  type PostInteractionRequest,
  type PostTreeRow,
  type PostsRequestStatus,
} from "@/entities/post";
import { Button } from "@/shared/ui/button";

interface PostsFeedProps {
  error: string | null;
  hasMore: boolean;
  onAttachmentPreview: AttachmentPreviewRequest;
  onLoadMore: () => void;
  onPostInteraction: PostInteractionRequest;
  onRetry: () => void;
  rows: PostTreeRow[];
  status: PostsRequestStatus;
}

export function PostsFeed({ error, hasMore, onAttachmentPreview, onLoadMore, onPostInteraction, onRetry, rows, status }: PostsFeedProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || status !== "ready") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, status]);

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
            <PostCard onAttachmentPreview={onAttachmentPreview} onPostInteraction={onPostInteraction} post={post} />
          </div>
        ))}
      </div>
      {status === "loadingMore" ? <p className="feed-more-state" role="status">Loading more…</p> : null}
      {status === "error" && rows.length > 0 ? (
        <div className="feed-more-state"><p role="alert">{error}</p><Button onClick={onRetry}>Retry next page</Button></div>
      ) : null}
      <div aria-hidden="true" className="feed-sentinel" ref={sentinelRef} />
    </section>
  );
}
