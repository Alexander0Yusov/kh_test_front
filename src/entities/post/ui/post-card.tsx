"use client";

import DOMPurify from "isomorphic-dompurify";
import { Paperclip, UserRound } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import type { PostViewModel } from "../model/posts-slice";

interface PostAvatarProps {
  url?: string | null;
}

function PostAvatar({ url }: PostAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <span aria-hidden="true" className="post-avatar post-avatar-fallback">
        <UserRound size={16} strokeWidth={1.75} />
      </span>
    );
  }

  return (
    <Image
      alt=""
      className="post-avatar"
      height={32}
      onError={() => setFailed(true)}
      src={url}
      unoptimized
      width={32}
    />
  );
}

function formatPublishDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

function getSafeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

interface PostCardProps {
  post: PostViewModel;
}

export function PostCard({ post }: PostCardProps) {
  const publishDate = formatPublishDate(post.publishDate);
  const attachmentUrl = getSafeExternalUrl(post.attachmentUrl);
  const homePage = getSafeExternalUrl(post.homePage);
  const sanitizedMessage = useMemo(
    () =>
      DOMPurify.sanitize(post.message, {
        ALLOWED_ATTR: ["href"],
        ALLOWED_TAGS: ["a", "strong", "i", "code"],
      }),
    [post.message],
  );

  return (
    <article className="post-card">
      <div className="post-metadata">
        <PostAvatar key={post.avatarUrl ?? "fallback"} url={post.avatarUrl} />
        <strong className="post-author">{post.userName}</strong>
        {homePage ? (
          <a href={homePage} rel="noopener noreferrer" target="_blank">
            Home page
          </a>
        ) : null}
        {post.email ? <a href={`mailto:${post.email}`}>{post.email}</a> : null}
        {attachmentUrl ? (
          <a
            aria-label="Open attachment"
            className="post-attachment"
            href={attachmentUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Paperclip aria-hidden="true" size={16} />
            Attachment
          </a>
        ) : null}
        {publishDate ? <time dateTime={String(post.publishDate)}>{publishDate}</time> : null}
      </div>
      <div
        className="post-message"
        dangerouslySetInnerHTML={{ __html: sanitizedMessage }}
      />
    </article>
  );
}
