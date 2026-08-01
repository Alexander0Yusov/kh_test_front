"use client";

import { Paperclip, UserRound } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import type { PostViewModel } from "../model/posts-slice";
import { formatPublishDate } from "../model/format-publish-date";
import { formatPostMetadataPreview } from "../model/format-post-metadata";
import { sanitizePostMessage } from "../model/sanitize-post-message";
import { CopyMetadataButton } from "./copy-metadata-button";

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
  onAttachmentPreview: AttachmentPreviewRequest;
  post: PostViewModel;
}

export type AttachmentPreviewRequest = (
  postId: string,
  trigger: HTMLButtonElement,
) => void;

export function PostCard({ onAttachmentPreview, post }: PostCardProps) {
  const publishDate = formatPublishDate(post.publishDate);
  const attachmentUrl = getSafeExternalUrl(post.attachmentUrl);
  const homePage = getSafeExternalUrl(post.homePage);
  const sanitizedMessage = useMemo(
    () =>
      sanitizePostMessage(post.message),
    [post.message],
  );

  return (
    <article className="post-card">
      <div className="post-metadata">
        <PostAvatar key={post.avatarUrl ?? "fallback"} url={post.avatarUrl} />
        <span className="post-metadata-pair">
          <strong className="post-author">{formatPostMetadataPreview(post.userName)}</strong>
          <CopyMetadataButton
            accessibleLabel="Copy user name"
            successMessage="User name copied."
            value={post.userName}
          />
        </span>
        {homePage ? (
          <span className="post-metadata-pair">
            <span className="post-metadata-value">{formatPostMetadataPreview(post.homePage ?? "")}</span>
            <CopyMetadataButton
              accessibleLabel="Copy home page"
              successMessage="Home page copied."
              value={post.homePage ?? ""}
            />
          </span>
        ) : (
          <span className="post-metadata-placeholder">[HomePage]</span>
        )}
        {post.email ? (
          <span className="post-metadata-pair">
            <span className="post-metadata-value">{formatPostMetadataPreview(post.email)}</span>
            <CopyMetadataButton
              accessibleLabel="Copy email"
              successMessage="Email copied."
              value={post.email}
            />
          </span>
        ) : null}
        {attachmentUrl ? (
          <button
            aria-label="Preview attachment"
            className="post-attachment"
            onClick={(event) => {
              event.stopPropagation();
              onAttachmentPreview(post.id, event.currentTarget);
            }}
            type="button"
          >
            <Paperclip aria-hidden="true" size={16} />
            Attachment
          </button>
        ) : null}
        {publishDate && typeof post.publishDate === "string" ? (
          <time dateTime={post.publishDate}>{publishDate}</time>
        ) : null}
      </div>
      <div
        className="post-message"
        dangerouslySetInnerHTML={{ __html: sanitizedMessage }}
      />
    </article>
  );
}
