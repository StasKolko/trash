const BYTES_IN_KB = 1024;
const BYTES_IN_MB = BYTES_IN_KB * BYTES_IN_KB;

export function formatFileSize(bytes: number): string {
  if (bytes < BYTES_IN_KB) {
    return `${bytes} B`;
  }
  if (bytes < BYTES_IN_MB) {
    return `${(bytes / BYTES_IN_KB).toFixed(1)} KB`;
  }
  return `${(bytes / BYTES_IN_MB).toFixed(1)} MB`;
}

export { BYTES_IN_KB, BYTES_IN_MB };
