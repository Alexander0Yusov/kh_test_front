"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

import type { AttachmentUploadController } from "../model/use-attachment-upload";

const BUSY_STAGES = [
  "requesting",
  "subscribing",
  "uploading",
  "awaitingConfirmation",
] as const;

const STATUS_LABELS = {
  awaitingConfirmation: "Waiting for file processing confirmation…",
  failed: "Attachment requires attention",
  idle: "No attachment selected",
  processing: "Processing attachment…",
  ready: "Attachment is ready",
  requesting: "Preparing file upload…",
  subscribing: "Subscribing to file notifications…",
  uploaded: "Attachment upload confirmed",
  uploading: "Uploading attachment to storage…",
  validating: "Validating attachment…",
} as const;

export function AttachmentUploadField({
  controller,
}: {
  controller: AttachmentUploadController;
}) {
  const busy = BUSY_STAGES.some((stage) => stage === controller.status);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField
      error={controller.error ?? undefined}
      htmlFor="create-post-attachment"
      label="Attachment (optional)"
    >
      <Input
        accept=".jpg,.jpeg,.png,.gif,.txt,image/jpeg,image/png,image/gif,text/plain"
        className="file-input-control"
        disabled={busy}
        id="create-post-attachment"
        key={controller.inputKey}
        onChange={controller.onFileChange}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
      <Button className="file-input-trigger" disabled={busy} onClick={() => inputRef.current?.click()}>
        Choose attachment
      </Button>
      {controller.file ? (
        <AttachmentPreview controller={controller} />
      ) : (
        <span className="attachment-status" role="status">
          {STATUS_LABELS[controller.status]}
        </span>
      )}
    </FormField>
  );
}

function AttachmentPreview({
  controller,
}: {
  controller: AttachmentUploadController;
}) {
  const file = controller.file;
  if (!file) return null;

  return (
    <div className="attachment-preview">
      {file.kind === "image" ? (
        <AttachmentImagePreview file={file.file} />
      ) : (
        <pre className="attachment-text-preview">{file.textPreview}</pre>
      )}
      <div className="attachment-preview-details">
        <span>{file.file.name}</span>
        <span>{file.file.type}</span>
        <span>{file.file.size} bytes</span>
        {file.kind === "image" ? (
          <span>{file.width} × {file.height}px</span>
        ) : null}
        <span>{STATUS_LABELS[controller.status]}</span>
      </div>
      <Button
        disabled={BUSY_STAGES.some((stage) => stage === controller.status)}
        onClick={controller.remove}
      >
        Remove attachment
      </Button>
    </div>
  );
}

function AttachmentImagePreview({ file }: { file: File }) {
  const [previewUrl] = useState(() => URL.createObjectURL(file));
  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  return (
    <Image
      alt="Attachment preview"
      className="attachment-preview-image"
      height={80}
      src={previewUrl}
      unoptimized
      width={80}
    />
  );
}
