export function authDestination(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\s]/.test(value)) return undefined;
  try {
    const url = new URL(value, "https://animeatlas.local");
    if (url.origin !== "https://animeatlas.local" || url.pathname === "/auth" || url.pathname === "/reset-password") return undefined;
    return url.pathname + url.search + url.hash;
  } catch { return undefined; }
}