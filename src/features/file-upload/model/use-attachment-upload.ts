"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  FileUploadedExpectation,
  FilesSocketClient,
  RestClient,
} from "@/shared/api";

import {
  type ProcessedAttachment,
  processAttachment,
} from "./process-attachment";
import { type FileUploadStage, uploadFile } from "./upload-file";

export type AttachmentStatus =
  | "idle"
  | "validating"
  | "processing"
  | "ready"
  | FileUploadStage
  | "failed";

export interface AttachmentUploadController {
  error: string | null;
  file: ProcessedAttachment | null;
  inputKey: number;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  remove: () => void;
  reset: () => void;
  status: AttachmentStatus;
  upload: () => Promise<string | undefined>;
}

export function useAttachmentUpload(
  client: RestClient,
  filesClient: FilesSocketClient,
): AttachmentUploadController {
  const [file, setFile] = useState<ProcessedAttachment | null>(null);
  const [status, setStatus] = useState<AttachmentStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const confirmedFileId = useRef<string | null>(null);
  const operation = useRef<Promise<string> | null>(null);
  const selectionVersion = useRef(0);
  const uploadExpectation = useRef<FileUploadedExpectation | null>(null);

  const cancelExpectation = useCallback(() => {
    const expectation = uploadExpectation.current;
    uploadExpectation.current = null;
    if (!expectation) return;
    expectation.cancel();
    void expectation.promise.catch(() => undefined);
  }, []);

  useEffect(() => () => cancelExpectation(), [cancelExpectation]);

  const reset = useCallback(() => {
    cancelExpectation();
    selectionVersion.current += 1;
    confirmedFileId.current = null;
    operation.current = null;
    setError(null);
    setFile(null);
    setInputKey((value) => value + 1);
    setStatus("idle");
  }, [cancelExpectation]);

  const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    selectionVersion.current += 1;
    const version = selectionVersion.current;
    const selected = event.target.files?.[0];
    confirmedFileId.current = null;
    operation.current = null;
    setError(null);
    setFile(null);

    if (!selected) {
      setStatus("idle");
      return;
    }

    setStatus("validating");
    void (async () => {
      try {
        setStatus("processing");
        const processed = await processAttachment(selected);
        if (version !== selectionVersion.current) return;
        setFile(processed);
        setStatus("ready");
      } catch (reason: unknown) {
        if (version !== selectionVersion.current) return;
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not process the attachment.",
        );
        setStatus("failed");
      }
    })();
  }, []);

  const upload = useCallback(async (): Promise<string | undefined> => {
    if (!file) return undefined;
    if (confirmedFileId.current) return confirmedFileId.current;
    if (operation.current) return operation.current;

    operation.current = uploadFile({
      client,
      extension: file.extension,
      file: file.file,
      filesClient,
      label: "attachment",
      onExpectation: (expectation) => {
        uploadExpectation.current = expectation;
      },
      onStage: setStatus,
    });

    try {
      const fileId = await operation.current;
      confirmedFileId.current = fileId;
      return fileId;
    } catch (reason: unknown) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Could not upload the attachment.";
      setError(message);
      setStatus("failed");
      throw new Error(message);
    } finally {
      operation.current = null;
    }
  }, [client, file, filesClient]);

  return {
    error,
    file,
    inputKey,
    onFileChange,
    remove: reset,
    reset,
    status,
    upload,
  };
}
