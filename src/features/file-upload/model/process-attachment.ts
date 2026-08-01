import {
  MAX_AVATAR_BYTES,
  type ProcessedAvatar,
  processAvatar,
} from "@/shared/lib/image-processing";

export type ProcessedAttachment =
  | ({ kind: "image" } & ProcessedAvatar)
  | {
      extension: ".txt";
      file: File;
      kind: "text";
      textPreview: string;
    };

const TEXT_MIME = "text/plain";

export async function processAttachment(
  file: File,
): Promise<ProcessedAttachment> {
  if (file.name.toLowerCase().endsWith(".txt")) {
    if (file.size === 0) throw new Error("The selected file is empty.");
    if (file.size > MAX_AVATAR_BYTES) {
      throw new Error("The attachment must not exceed 100 KiB.");
    }
    if (file.type !== TEXT_MIME) {
      throw new Error("The TXT extension and MIME type do not match.");
    }

    const content = await file.text();
    if (content.includes("\0")) {
      throw new Error("The TXT attachment is not readable text.");
    }

    return {
      extension: ".txt",
      file,
      kind: "text",
      textPreview: content.slice(0, 500),
    };
  }

  const image = await processAvatar(file);
  return { ...image, kind: "image" };
}
