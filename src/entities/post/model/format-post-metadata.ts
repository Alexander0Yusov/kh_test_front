const METADATA_PREVIEW_LENGTH = 10;

export function formatPostMetadataPreview(value: string): string {
  return Array.from(value).slice(0, METADATA_PREVIEW_LENGTH).join("");
}
