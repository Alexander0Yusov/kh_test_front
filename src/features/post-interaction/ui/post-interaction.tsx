"use client";

import { Paperclip, UserRound } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useMemo, useState } from "react";

import {
  type PostViewModel,
  formatPublishDate,
  sanitizePostMessage,
} from "@/entities/post";
import type { RestClient } from "@/shared/api";
import { Button } from "@/shared/ui/button";

import { usePostInteraction } from "../model/use-post-interaction";

interface PostInteractionProps {
  answerForm: ReactNode;
  client: RestClient;
  initialPost: PostViewModel | null;
  onLoaded: (post: PostViewModel) => void;
  onLogin: () => void;
  postId: string;
  sessionStatus: "anonymous" | "authenticated" | "error" | "idle" | "restoring";
}

function PostInteractionAvatar({ url }: { url: string | null | undefined }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return <span aria-hidden="true" className="post-avatar post-avatar-fallback"><UserRound size={16} /></span>;
  }
  return <Image alt="" className="post-avatar" height={32} onError={() => setFailed(true)} src={url} unoptimized width={32} />;
}

export function PostInteraction({
  answerForm,
  client,
  initialPost,
  onLoaded,
  onLogin,
  postId,
  sessionStatus,
}: PostInteractionProps) {
  const { request, state } = usePostInteraction({ client, initialPost, onLoaded, postId });
  const post = state.status === "ready"
    ? state.post
    : state.status === "loading"
      ? state.cachedPost
      : null;
  const safeMessage = useMemo(
    () => post ? sanitizePostMessage(post.message) : "",
    [post],
  );
  const publishDate = formatPublishDate(post?.publishDate);

  return (
    <div className="post-interaction">
      <section aria-label="Published post" className="post-read-section">
        {state.status === "loading" ? <p role="status">Loading post…</p> : null}
        {state.status === "not-found" ? <p role="alert">Post is no longer available.</p> : null}
        {state.status === "error" ? (
          <div className="post-read-error"><p role="alert">The post could not be loaded.</p><Button onClick={() => void request()}>Retry</Button></div>
        ) : null}
        {post ? (
          <>
            <div className="post-read-metadata">
              <PostInteractionAvatar url={post.avatarUrl} />
              <strong>{post.userName}</strong>
              <span>{post.homePage ?? "[HomePage]"}</span>
              {post.email ? <span>{post.email}</span> : null}
              {post.attachmentUrl ? <span className="post-read-attachment"><Paperclip aria-hidden="true" size={16} /> Attachment</span> : null}
              {publishDate && typeof post.publishDate === "string" ? <time dateTime={post.publishDate}>{publishDate}</time> : null}
            </div>
            <div className="post-full-message" dangerouslySetInnerHTML={{ __html: safeMessage }} />
          </>
        ) : null}
      </section>
      <section aria-label="Answer" className="post-answer-section">
        {sessionStatus === "authenticated" && state.status === "ready" ? answerForm : null}
        {sessionStatus === "anonymous" && state.status === "ready" ? <div className="post-answer-notice"><p>Log in to answer</p><Button onClick={onLogin}>Log In</Button></div> : null}
        {sessionStatus === "idle" || sessionStatus === "restoring" ? <p role="status">Restoring session…</p> : null}
        {sessionStatus === "error" ? <p role="alert">Answering is unavailable until the session is restored.</p> : null}
      </section>
    </div>
  );
}
