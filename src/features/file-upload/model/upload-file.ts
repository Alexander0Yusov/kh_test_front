import type {
  FileUploadedExpectation,
  FilesSocketClient,
  RestClient,
  components,
} from "@/shared/api";

type CreateUploadRequest = components["schemas"]["CreateUploadDto"];

export type FileUploadStage =
  | "requesting"
  | "subscribing"
  | "uploading"
  | "awaitingConfirmation"
  | "uploaded";

interface UploadFileOptions {
  client: RestClient;
  extension: string;
  file: File;
  filesClient: FilesSocketClient;
  label: string;
  onExpectation: (expectation: FileUploadedExpectation | null) => void;
  onStage: (stage: FileUploadStage) => void;
}

export async function uploadFile({
  client,
  extension,
  file,
  filesClient,
  label,
  onExpectation,
  onStage,
}: UploadFileOptions): Promise<string> {
  onStage("requesting");
  const body = {
    fileExtension: extension,
    fileSize: file.size,
  } satisfies CreateUploadRequest;
  const uploadRequest = await client.POST("/files/upload-request", { body });

  if (!uploadRequest.data) {
    throw new Error(`Could not prepare the ${label} upload.`);
  }

  const { fileId, uploadFields, uploadUrl } = uploadRequest.data;
  const uploaded = filesClient.expectUploaded(fileId);
  onExpectation(uploaded);

  try {
    onStage("subscribing");
    await filesClient.subscribe(fileId);
    onStage("uploading");
    const formData = new FormData();
    for (const [name, value] of Object.entries(uploadFields)) {
      formData.append(name, value);
    }
    formData.append("file", file);

    let storageResponse: Response;
    try {
      storageResponse = await fetch(uploadUrl, {
        body: formData,
        method: "POST",
      });
    } catch {
      throw new Error(
        `Could not upload the ${label} to storage. Check storage availability and CORS.`,
      );
    }

    if (!storageResponse.ok) {
      throw new Error(
        `Storage rejected the ${label} upload with HTTP ${storageResponse.status}.`,
      );
    }

    onStage("awaitingConfirmation");
    uploaded.startTimeout();
    await uploaded.promise;
    onExpectation(null);
    onStage("uploaded");
    return fileId;
  } catch (reason: unknown) {
    uploaded.cancel(reason instanceof Error ? reason : undefined);
    onExpectation(null);
    void uploaded.promise.catch(() => undefined);
    throw reason;
  }
}
