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
