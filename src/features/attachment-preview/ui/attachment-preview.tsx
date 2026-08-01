"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { detectAttachmentType } from "../model/detect-attachment-type";

interface AttachmentPreviewProps {
  attachmentUrl: string | null;
}

type TextPreviewState =
  | { status: "loading" }
  | { status: "ready"; text: string }
  | { status: "error" };

export function AttachmentPreview({ attachmentUrl }: AttachmentPreviewProps) {
  const type = attachmentUrl ? detectAttachmentType(attachmentUrl) : "unsupported";
  const [imageStatus, setImageStatus] = useState<"loading" | "ready" | "error">("loading");
  const [textState, setTextState] = useState<TextPreviewState>({ status: "loading" });

  useEffect(() => {
    if (!attachmentUrl || type !== "text") return;

    const controller = new AbortController();
    void fetch(attachmentUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Attachment request failed.");
        return response.text();
      })
      .then((text) => setTextState({ status: "ready", text }))
      .catch((reason: unknown) => {
        if (!(reason instanceof Error && reason.name === "AbortError")) {
          setTextState({ status: "error" });
        }
      });

    return () => controller.abort();
  }, [attachmentUrl, type]);

  if (!attachmentUrl) {
    return <p role="status">This attachment is no longer available.</p>;
  }

  if (type === "image") {
    return (
      <div className="attachment-preview-image-area">
        {imageStatus === "loading" ? <p role="status">Loading attachment…</p> : null}
        {imageStatus === "error" ? <p role="alert">The image could not be displayed.</p> : null}
        {imageStatus !== "error" ? (
          <Image
            alt="Post attachment preview"
            className={imageStatus === "ready" ? "is-ready" : ""}
            fill
            onError={() => setImageStatus("error")}
            onLoad={() => setImageStatus("ready")}
            sizes="min(90vw, 48rem)"
            src={attachmentUrl}
            unoptimized
          />
        ) : null}
      </div>
    );
  }

  if (type === "text") {
    if (textState.status === "loading") {
      return <p role="status">Loading attachment…</p>;
    }
    if (textState.status === "error") {
      return <p role="alert">The text attachment could not be displayed.</p>;
    }
    return <pre className="attachment-preview-text">{textState.text}</pre>;
  }

  return <p role="status">Preview is unavailable for this attachment type.</p>;
}
