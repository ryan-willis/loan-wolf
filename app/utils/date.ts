export function formatDate(d: Date | number | string) {
  return typeof d === "string"
    ? d
    : (typeof d === "number" ? new Date(d) : d).toLocaleDateString("default", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
}

export function isWithinInterval(
  d8: number,
  interval: { start: number; end: number }
) {
  return d8 >= interval.start && d8 <= interval.end;
}
