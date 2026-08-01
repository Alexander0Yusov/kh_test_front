const KYIV_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Kyiv",
  year: "numeric",
});

export function formatPublishDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Map(
    KYIV_DATE_FORMATTER.formatToParts(date).map((part) => [
      part.type,
      part.value,
    ]),
  );
  const day = parts.get("day");
  const month = parts.get("month");
  const year = parts.get("year");
  const hour = parts.get("hour");
  const minute = parts.get("minute");

  if (!day || !month || !year || !hour || !minute) return null;
  return `${day}.${month}.${year}-${hour}:${minute}`;
}
