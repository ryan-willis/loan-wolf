export function formatDate(d: Date | number) {
  return (typeof d === "number" ? new Date(d) : d).toLocaleDateString(
    "default",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }
  );
}
