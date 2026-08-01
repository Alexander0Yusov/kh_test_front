import { type Socket, io } from "socket.io-client";
import { z } from "zod";

import { getFilesSocketUrl } from "../config";

const subscribedSchema = z.object({ fileId: z.uuid() });
const uploadedSchema = z.object({
  fileId: z.uuid(),
  status: z.literal("UPLOADED"),
});

export interface FileUploadedExpectation {
  cancel: (reason?: Error) => void;
  promise: Promise<void>;
  startTimeout: () => void;
}

const UPLOAD_EVENT_TIMEOUT_MS = 30_000;
const SUBSCRIPTION_TIMEOUT_MS = 10_000;

export class FilesSocketClient {
  readonly #socket: Socket;
  readonly #pendingSubscriptions = new Set<string>();
  readonly #pendingUploads = new Set<string>();
  readonly #subscriptionCancellations = new Map<
    string,
    Set<(error: Error) => void>
  >();
  readonly #uploadCancellations = new Map<
    string,
    Set<(error: Error) => void>
  >();

  public constructor(backendUrl: string) {
    this.#socket = io(getFilesSocketUrl(backendUrl), {
      autoConnect: false,
      withCredentials: true,
    });
    this.#socket.on("connect", this.#resubscribe);
  }

  public connect(): void {
    this.#socket.connect();
  }

  public disconnect(): void {
    const error = new Error("Files connection closed.");
    for (const cancellations of this.#subscriptionCancellations.values()) {
      for (const cancel of cancellations) cancel(error);
    }
    this.#subscriptionCancellations.clear();
    for (const cancellations of this.#uploadCancellations.values()) {
      for (const cancel of cancellations) cancel(error);
    }
    this.#uploadCancellations.clear();
    this.#socket.off("connect", this.#resubscribe);
    this.#socket.disconnect();
  }

  public expectUploaded(fileId: string): FileUploadedExpectation {
    let cancelExpectation: (reason?: Error) => void = () => undefined;
    let startExpectationTimeout = (): void => undefined;

    const promise = new Promise<void>((resolve, reject) => {
      let settled = false;
      let timer: number | null = null;

      const finish = (error?: Error): void => {
        if (settled) return;
        settled = true;
        if (timer !== null) window.clearTimeout(timer);
        this.#socket.off("files.uploaded", handleUploaded);
        this.#pendingUploads.delete(fileId);
        cancellations.delete(cancelExpectation);
        if (cancellations.size === 0) {
          this.#uploadCancellations.delete(fileId);
        }

        if (error) {
          reject(error);
          return;
        }
        resolve();
      };

      const handleUploaded = (payload: unknown): void => {
        const result = uploadedSchema.safeParse(payload);
        if (!result.success || result.data.fileId !== fileId) return;
        finish();
      };

      cancelExpectation = (reason = new Error("File upload cancelled.")) => {
        finish(reason);
      };
      startExpectationTimeout = () => {
        if (settled || timer !== null) return;
        timer = window.setTimeout(() => {
          finish(new Error("File processing confirmation timed out."));
        }, UPLOAD_EVENT_TIMEOUT_MS);
      };

      const cancellations =
        this.#uploadCancellations.get(fileId) ??
        new Set<(error: Error) => void>();
      cancellations.add(cancelExpectation);
      this.#uploadCancellations.set(fileId, cancellations);
      this.#pendingUploads.add(fileId);
      this.#socket.on("files.uploaded", handleUploaded);
    });

    return {
      cancel: (reason) => cancelExpectation(reason),
      promise,
      startTimeout: () => startExpectationTimeout(),
    };
  }

  public async subscribe(fileId: string): Promise<void> {
    this.#pendingSubscriptions.add(fileId);

    await new Promise<void>((resolve, reject) => {
      let settled = false;

      const finish = (error?: Error): void => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        this.#socket.off("files.subscribed", handleSubscribed);
        this.#pendingSubscriptions.delete(fileId);
        cancellations.delete(finish);
        if (cancellations.size === 0) {
          this.#subscriptionCancellations.delete(fileId);
        }

        if (error) {
          reject(error);
          return;
        }

        resolve();
      };

      const handleSubscribed = (payload: unknown): void => {
        const result = subscribedSchema.safeParse(payload);
        if (!result.success || result.data.fileId !== fileId) return;
        finish();
      };

      const timer = window.setTimeout(() => {
        finish(
          new Error("Could not subscribe to file upload notifications."),
        );
      }, SUBSCRIPTION_TIMEOUT_MS);

      const cancellations =
        this.#subscriptionCancellations.get(fileId) ??
        new Set<(error: Error) => void>();
      cancellations.add(finish);
      this.#subscriptionCancellations.set(fileId, cancellations);
      this.#socket.on("files.subscribed", handleSubscribed);
      if (this.#socket.connected) {
        this.#socket.emit("files.subscribe", { fileId });
      }
    });
  }

  #resubscribe = (): void => {
    const pending = new Set([
      ...this.#pendingSubscriptions,
      ...this.#pendingUploads,
    ]);
    for (const fileId of pending) {
      this.#socket.emit("files.subscribe", { fileId });
    }
  };

}
