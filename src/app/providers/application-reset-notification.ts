export const APPLICATION_ERASE_EVENT_KEY = "application-data-erased:v1";

export function publishApplicationErase(): void {
  try {
    window.localStorage.setItem(
      APPLICATION_ERASE_EVENT_KEY,
      `${Date.now()}:${window.crypto.randomUUID()}`,
    );
    window.localStorage.removeItem(APPLICATION_ERASE_EVENT_KEY);
  } catch {
    // Cross-tab notification is best-effort; the local reset is authoritative.
  }
}
