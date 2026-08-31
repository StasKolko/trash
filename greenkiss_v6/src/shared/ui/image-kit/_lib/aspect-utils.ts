import type { AspectRatio, SizePx } from './types';

export function parseAspectRatio(aspect: AspectRatio): number {
  const [w, h] = aspect.split(':').map(Number);
  if (!w || !h) {
    throw new Error(`Invalid AspectRatio string: "${aspect}"`);
  }
  return w / h;
}

export function inferAspectRatio(width: number, height: number): AspectRatio | undefined {
  // Returns closest known aspect ratio within a small epsilon
  if (width <= 0 || height <= 0) return undefined;
  const ratio = width / height;
  const candidates: AspectRatio[] = ['1:1', '3:4', '4:3', '16:9', '9:16'];
  const epsilon = 0.01;

  for (const aspect of candidates) {
    const r = parseAspectRatio(aspect);
    if (Math.abs(ratio - r) <= epsilon) return aspect;
  }
  return undefined;
}

export function sizeMatchesAspect(size: SizePx, aspect: AspectRatio): boolean {
  const target = parseAspectRatio(aspect);
  const actual = size.width / size.height;
  const epsilon = 0.01;
  return Math.abs(actual - target) <= epsilon;
}

export function ensureSizeMatchesAspect(size: SizePx, aspect: AspectRatio): void {
  if (!sizeMatchesAspect(size, aspect)) {
    throw new Error(
      `Target size ${size.width}x${size.height} does not match aspect ${aspect}. ` +
        'This must be fixed before rendering.'
    );
  }
}
