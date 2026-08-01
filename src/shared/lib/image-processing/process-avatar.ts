import pica from "pica";

import {
  type AvatarExtension,
  MAX_AVATAR_BYTES,
  MAX_AVATAR_HEIGHT,
  MAX_AVATAR_WIDTH,
  type ProcessedAvatar,
} from "./image-contract";

const MIME_BY_EXTENSION = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
} as const;

function getExtension(name: string): keyof typeof MIME_BY_EXTENSION | null {
  const match = /\.[^.]+$/.exec(name.toLowerCase());
  const extension = match?.[0];
  return extension && extension in MIME_BY_EXTENSION
    ? (extension as keyof typeof MIME_BY_EXTENSION)
    : null;
}

function sniffMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
    bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a &&
    bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  const signature = new TextDecoder("ascii").decode(bytes.slice(0, 6));
  return signature === "GIF87a" || signature === "GIF89a" ? "image/gif" : null;
}

function targetDimensions(width: number, height: number): [number, number] {
  const scale = Math.min(1, MAX_AVATAR_WIDTH / width, MAX_AVATAR_HEIGHT / height);
  return [Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale))];
}

function outputName(name: string, extension: AvatarExtension): string {
  return `${name.replace(/\.[^.]+$/, "")}${extension}`;
}

async function canvasBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob) throw new Error("Could not process the image.");
  return blob;
}

async function verifyRaster(blob: Blob, width: number, height: number): Promise<void> {
  if (blob.size === 0 || blob.size > MAX_AVATAR_BYTES) {
    throw new Error("The processed avatar size is invalid.");
  }
  const bitmap = await createImageBitmap(blob);
  try {
    if (bitmap.width !== width || bitmap.height !== height) {
      throw new Error("The image failed the processed dimensions check.");
    }
  } finally {
    bitmap.close();
  }
}

async function processRaster(
  file: File,
  extension: ".jpeg" | ".jpg" | ".png",
): Promise<ProcessedAvatar> {
  const bitmap = await createImageBitmap(file);
  try {
    const [width, height] = targetDimensions(bitmap.width, bitmap.height);
    const normalizedExtension: AvatarExtension = extension === ".jpeg" ? ".jpg" : extension;
    if (width === bitmap.width && height === bitmap.height && file.size <= MAX_AVATAR_BYTES) {
      return { extension: normalizedExtension, file: extension === ".jpeg"
        ? new File([file], outputName(file.name, ".jpg"), { type: file.type })
        : file, height, width };
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    await pica().resize(bitmap, canvas);
    const qualities = extension === ".png" ? [undefined] : [0.9, 0.8, 0.7, 0.6, 0.55];
    for (const quality of qualities) {
      const blob = await canvasBlob(canvas, MIME_BY_EXTENSION[extension], quality);
      if (blob.size <= MAX_AVATAR_BYTES) {
        await verifyRaster(blob, width, height);
        return {
          extension: normalizedExtension,
          file: new File([blob], outputName(file.name, normalizedExtension), {
            type: MIME_BY_EXTENSION[extension],
          }),
          height,
          width,
        };
      }
    }
    throw new Error("The image cannot be reduced to 100 KiB without changing its format.");
  } finally {
    bitmap.close();
  }
}

export async function processAvatar(file: File): Promise<ProcessedAvatar> {
  if (file.size === 0) throw new Error("The selected file is empty.");
  const extension = getExtension(file.name);
  if (!extension) throw new Error("Only JPG, JPEG, PNG, and GIF files are allowed.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const detectedMime = sniffMime(bytes);
  if (!detectedMime || detectedMime !== MIME_BY_EXTENSION[extension] || file.type !== detectedMime) {
    throw new Error("The image extension, MIME type, and content do not match.");
  }

  if (extension === ".gif") {
    const { processGifAvatar } = await import("./process-gif-avatar");
    return processGifAvatar(file);
  }
  return processRaster(file, extension);
}
