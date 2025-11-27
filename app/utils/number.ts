export const getOrdinalSuffix = (n: number) => {
  const s = ["th", "st", "nd", "rd", "th"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};
