export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString();
}