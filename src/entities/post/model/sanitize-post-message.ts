import DOMPurify, { type Config } from "isomorphic-dompurify";

const SANITIZE_CONFIG = {
  ALLOWED_ATTR: ["href", "title"],
  ALLOWED_TAGS: ["a", "strong", "i", "code"],
  ALLOW_UNKNOWN_PROTOCOLS: false,
} satisfies Config;

export function sanitizePostMessage(message: string): string {
  return DOMPurify.sanitize(message, SANITIZE_CONFIG);
}

export function isSanitizedPostMessageEmpty(message: string): boolean {
  const text = DOMPurify.sanitize(message, {
    ALLOWED_ATTR: [],
    ALLOWED_TAGS: [],
  });
  return text.replace(/&nbsp;|&#160;/gi, " ").trim().length === 0;
}
