export type AttachmentPreviewType = "image" | "text" | "unsupported";

const IMAGE_EXTENSIONS = new Set([".gif", ".jpeg", ".jpg", ".png"]);

export function detectAttachmentType(urlValue: string): AttachmentPreviewType {
  try {
    const pathname = new URL(urlValue).pathname.toLowerCase();
    const dotIndex = pathname.lastIndexOf(".");
    const extension = dotIndex >= 0 ? pathname.slice(dotIndex) : "";

    if (IMAGE_EXTENSIONS.has(extension)) return "image";
    if (extension === ".txt") return "text";
  } catch {
    return "unsupported";
  }

  return "unsupported";
}
