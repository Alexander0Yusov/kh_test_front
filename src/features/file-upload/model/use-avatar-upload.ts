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
  components,
} from "@/shared/api";
import { type ProcessedAvatar, processAvatar } from "@/shared/lib/image-processing";

export type UploadStatus =
  | "idle"
  | "validating"
  | "processing"
  | "ready"
  | "requesting"
  | "subscribing"
  | "uploading"
  | "awaitingConfirmation"
  | "uploaded"
  | "failed";

type CreateUploadRequest = components["schemas"]["CreateUploadDto"];

export interface AvatarUploadController {
  error: string | null;
  file: ProcessedAvatar | null;
  inputKey: number;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  remove: () => void;
  reset: () => void;
  status: UploadStatus;
  upload: () => Promise<string>;
}

export function useAvatarUpload(
  client: RestClient,
  filesClient: FilesSocketClient,
): AvatarUploadController {
  const [file, setFile] = useState<ProcessedAvatar | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const confirmedFileId = useRef<string | null>(null);
  const operation = useRef<Promise<string> | null>(null);
  const selectionVersion = useRef(0);
  const uploadExpectation = useRef<FileUploadedExpectation | null>(null);

  const cancelUploadExpectation = useCallback(() => {
    const expectation = uploadExpectation.current;
    uploadExpectation.current = null;
    if (!expectation) return;
    expectation.cancel();
    void expectation.promise.catch(() => undefined);
  }, []);

  useEffect(
    () => () => cancelUploadExpectation(),
    [cancelUploadExpectation],
  );

  const reset = useCallback(() => {
    cancelUploadExpectation();
    selectionVersion.current += 1;
    setFile(null);
    setStatus("idle");
    setError(null);
    setInputKey((value) => value + 1);
    confirmedFileId.current = null;
    operation.current = null;
  }, [cancelUploadExpectation]);

  const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    selectionVersion.current += 1;
    const version = selectionVersion.current;
    const selected = event.target.files?.[0];
    confirmedFileId.current = null;
    operation.current = null;
    setFile(null);
    setError(null);
    if (!selected) {
      setStatus("idle");
      return;
    }
    setStatus("validating");
    void (async () => {
      try {
        setStatus("processing");
        const processed = await processAvatar(selected);
        if (version !== selectionVersion.current) return;
        setFile(processed);
        setStatus("ready");
      } catch (reason: unknown) {
        if (version !== selectionVersion.current) return;
        setError(reason instanceof Error ? reason.message : "Не удалось обработать avatar.");
        setStatus("failed");
      }
    })();
  }, []);

  const upload = useCallback(async (): Promise<string> => {
    if (confirmedFileId.current) return confirmedFileId.current;
    if (!file) throw new Error("Выберите и подготовьте avatar.");
    if (operation.current) return operation.current;

    operation.current = (async () => {
      try {
        setError(null);
        setStatus("requesting");
        const body = {
          fileExtension: file.extension,
          fileSize: file.file.size,
        } satisfies CreateUploadRequest;
        const uploadRequest = await client.POST("/files/upload-request", { body });
        if (!uploadRequest.data) throw new Error("Не удалось подготовить загрузку avatar.");

        const { fileId, uploadFields, uploadUrl } = uploadRequest.data;
        const uploaded = filesClient.expectUploaded(fileId);
        uploadExpectation.current = uploaded;
        setStatus("subscribing");
        await filesClient.subscribe(fileId);
        setStatus("uploading");
        const formData = new FormData();
        for (const [name, value] of Object.entries(uploadFields)) formData.append(name, value);
        formData.append("file", file.file);
        let storageResponse: Response;
        try {
          storageResponse = await fetch(uploadUrl, {
            body: formData,
            method: "POST",
          });
        } catch {
          throw new Error(
            "Could not upload avatar to storage. Check storage availability and CORS.",
          );
        }
        if (!storageResponse.ok) {
          throw new Error(
            `Storage rejected avatar upload with HTTP ${storageResponse.status}.`,
          );
        }
        setStatus("awaitingConfirmation");
        uploaded.startTimeout();
        await uploaded.promise;
        uploadExpectation.current = null;
        confirmedFileId.current = fileId;
        setStatus("uploaded");
        return fileId;
      } catch (reason: unknown) {
        cancelUploadExpectation();
        const message = reason instanceof Error ? reason.message : "Не удалось загрузить avatar.";
        setError(message);
        setStatus("failed");
        throw new Error(message);
      } finally {
        operation.current = null;
      }
    })();
    return operation.current;
  }, [cancelUploadExpectation, client, file, filesClient]);

  return { error, file, inputKey, onFileChange, remove: reset, reset, status, upload };
}
