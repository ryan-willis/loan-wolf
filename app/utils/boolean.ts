export const isTruthy = (value: boolean | string | null | undefined) =>
  typeof value === "boolean"
    ? value
    : ["true", "1", "yes", "y", "on"].includes(String(value));
