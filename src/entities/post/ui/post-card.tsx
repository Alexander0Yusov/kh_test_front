"use client";

import { Copy, Paperclip, UserRound } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import type { PostFieldSelection, PostViewModel } from "../model/posts-slice";
import { formatPublishDate } from "../model/format-publish-date";
import { formatPostMetadataPreview } from "../model/format-post-metadata";
import { sanitizePostMessage } from "../model/sanitize-post-message";
import { CopyMetadataButton } from "./copy-metadata-button";

interface PostAvatarProps {
  url?: string | null;
}

interface MetadataIconPlaceholderProps {
  icon: "attachment" | "copy";
}

function MetadataIconPlaceholder({ icon }: MetadataIconPlaceholderProps) {
  return (
    <span
      aria-hidden="true"
      className="post-icon-plaque post-icon-plaque-placeholder"
    >
      {icon === "copy" ? (
        <Copy size={14} />
      ) : (
        <Paperclip size={16} />
      )}
    </span>
  );
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
  fields: PostFieldSelection;
  onAttachmentPreview: AttachmentPreviewRequest;
  onPostInteraction: PostInteractionRequest;
  post: PostViewModel;
}

function buildMetadataGrid(fields: PostFieldSelection): string {
  const columns = fields.avatar ? ["var(--post-metadata-avatar-slot)"] : [];
  columns.push("var(--post-metadata-text-slot)", "var(--post-metadata-action-slot)");
  if (fields.email) columns.push("var(--post-metadata-text-slot)", "var(--post-metadata-action-slot)");
  if (fields.homePage) columns.push("var(--post-metadata-text-slot)", "var(--post-metadata-action-slot)");
  if (fields.attachment) columns.push("var(--post-metadata-text-slot)", "var(--post-metadata-action-slot)");
  if (fields.publishDate) columns.push("var(--post-metadata-date-slot)");
  return columns.join(" ");
}

export type AttachmentPreviewRequest = (
  postId: string,
  trigger: HTMLButtonElement,
) => void;

export type PostInteractionRequest = (
  postId: string,
  trigger: HTMLButtonElement,
) => void;

export function PostCard({ fields, onAttachmentPreview, onPostInteraction, post }: PostCardProps) {
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
      <div className="post-metadata" style={{ gridTemplateColumns: buildMetadataGrid(fields) }}>
        {fields.avatar ? <PostAvatar key={post.avatarUrl ?? "fallback"} url={post.avatarUrl} /> : null}
        <strong className="post-author post-metadata-text">
          {formatPostMetadataPreview(post.userName)}
        </strong>
        <span className="post-metadata-action">
          <CopyMetadataButton
            accessibleLabel="Copy full username"
            successMessage="Username copied."
            value={post.userName}
          />
        </span>
        {fields.email ? <><span
          aria-hidden={post.email ? undefined : true}
          className="post-metadata-text"
        >
          {post.email ? formatPostMetadataPreview(post.email) : null}
        </span>
        <span
          aria-hidden={post.email ? undefined : true}
          className="post-metadata-action"
        >
          {post.email ? (
            <CopyMetadataButton
              accessibleLabel="Copy full email"
              successMessage="Email copied."
              value={post.email}
            />
          ) : null}
        </span></> : null}
        {fields.homePage ? <>{homePage ? (
          <span className="post-metadata-text">
            {formatPostMetadataPreview(post.homePage ?? "")}
          </span>
        ) : (
          <span className="post-metadata-placeholder post-metadata-text">[HomePage]</span>
        )}
        <span
          aria-hidden={homePage ? undefined : true}
          className="post-metadata-action"
        >
          {homePage ? (
            <CopyMetadataButton
              accessibleLabel="Copy full homepage"
              successMessage="Home page copied."
              value={post.homePage ?? ""}
            />
          ) : (
            <MetadataIconPlaceholder icon="copy" />
          )}
        </span></> : null}
        {fields.attachment ? <><span
          className={attachmentUrl
            ? "post-metadata-text"
            : "post-metadata-placeholder post-metadata-text"}
        >
          Attachment
        </span><span
          aria-hidden={attachmentUrl ? undefined : true}
          className="post-metadata-action"
        >
          {attachmentUrl ? (
            <button
              aria-label="Preview attachment"
              className="post-attachment post-icon-plaque"
              onClick={(event) => {
                event.stopPropagation();
                onAttachmentPreview(post.id, event.currentTarget);
              }}
              type="button"
            >
              <Paperclip aria-hidden="true" size={16} />
            </button>
          ) : (
            <MetadataIconPlaceholder icon="attachment" />
          )}
        </span></> : null}
        {fields.publishDate ? <span
          aria-hidden={publishDate ? undefined : true}
          className="post-date-slot"
        >
          {publishDate && typeof post.publishDate === "string" ? (
            <time dateTime={post.publishDate}>{publishDate}</time>
          ) : null}
        </span> : null}
      </div>
      <div
        className="post-message"
        dangerouslySetInnerHTML={{ __html: sanitizedMessage }}
      />
      <button
        aria-label={`Read and answer post by ${post.userName}`}
        className="post-open-action"
        onClick={(event) => onPostInteraction(post.id, event.currentTarget)}
        type="button"
      />
    </article>
  );
}
