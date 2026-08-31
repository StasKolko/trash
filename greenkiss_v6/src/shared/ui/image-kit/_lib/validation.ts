import type {
  AllowedExtensions,
  AspectRatio,
  SizePx,
} from './types';
import { isExtensionAllowed } from './file-utils';
import { sizeMatchesAspect } from './aspect-utils';

export type ImageValidationOptions = {
  allowedExtensions?: AllowedExtensions;
  minWidth?: number;
  minHeight?: number;
  minBytes?: number;
  maxBytes?: number;
  aspect?: AspectRatio;
  targetSize?: SizePx;
};

export type ImageValidationResult = {
  ok: boolean;
  error?: string;
};

export function validateImageFile(
  file: File,
  size: SizePx,
  bytes: number,
  options: ImageValidationOptions
): ImageValidationResult {
  const {
    allowedExtensions,
    minWidth,
    minHeight,
    minBytes,
    maxBytes,
    aspect,
    targetSize,
  } = options;

  if (!isExtensionAllowed(file.name, allowedExtensions)) {
    return {
      ok: false,
      error: 'Extension not allowed for this image',
    };
  }

  if (minWidth != null && size.width < minWidth) {
    return {
      ok: false,
      error: 'Image width is below minimum requirement',
    };
  }

  if (minHeight != null && size.height < minHeight) {
    return {
      ok: false,
      error: 'Image height is below minimum requirement',
    };
  }

  if (minBytes != null && bytes < minBytes) {
    return {
      ok: false,
      error: 'Image size in bytes is below minimum',
    };
  }

  if (maxBytes != null && bytes > maxBytes) {
    return {
      ok: false,
      error: 'Image size in bytes exceeds maximum',
    };
  }

  if (aspect && !targetSize) {
    if (!sizeMatchesAspect(size, aspect)) {
      return {
        ok: false,
        error: 'Image aspect ratio does not match required aspect',
      };
    }
  }

  if (targetSize && aspect && !sizeMatchesAspect(targetSize, aspect)) {
    // For dev: targetSize must be consistent with aspect.
    throw new Error(
      `targetSize ${targetSize.width}x${targetSize.height} does not match aspect ${aspect}`
    );
  }

  return { ok: true };
}
