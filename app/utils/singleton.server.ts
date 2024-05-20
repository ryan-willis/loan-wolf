export function singleton<T>(name: string, create: () => T): T {
  const g = global as unknown as Record<string, Record<string, T>>;
  g.__loanwolf ??= {};
  g.__loanwolf[name] ??= create();
  return g.__loanwolf[name];
}
