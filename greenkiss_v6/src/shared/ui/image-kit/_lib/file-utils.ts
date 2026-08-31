import type { AllowedExtensions, OutputFormat } from './types';

export function extensionFromMime(mime: string): OutputFormat | undefined {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/jpeg') return 'jpg';
  return undefined;
}

export function detectOutputMimeFromFormat(format: OutputFormat): string {
  switch (format) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpg':
      return 'image/jpeg';
    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
}

export function isExtensionAllowed(
  fileName: string,
  allowed?: AllowedExtensions
): boolean {
  const lower = fileName.toLowerCase();
  const ext = lower.split('.').pop() || '';
  const map = allowed ?? { png: true, webp: true, jpg: true, jpeg: true };

  if (ext === 'png') return !!map.png;
  if (ext === 'webp') return !!map.webp;
  if (ext === 'jpg') return !!map.jpg;
  if (ext === 'jpeg') return !!map.jpeg;
  return false;
}

export function blobToFileWithName(
  blob: Blob,
  baseName: string,
  mime: string
): File {
  const ext = extensionFromMime(mime) ?? 'jpg';
  const safeBase = baseName.replace(/\.[^.]+$/, '');
  const fileName = `${safeBase}.${ext}`;
  return new File([blob], fileName, { type: mime });
}

export function formatBytesToHuman(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kib = bytes / 1024;
  if (kib < 1024) return `${kib.toFixed(1)} KiB`;
  const mib = kib / 1024;
  return `${mib.toFixed(2)} MiB`;
}
