export function logFavicon(event: string, data?: unknown) {
  const ts = new Date().toISOString();
  console.log(`[favicon] ${ts} ${event}`, data ?? "");
}
