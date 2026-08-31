export type AllowedExtensions = {
  png?: boolean;
  webp?: boolean;
  jpeg?: boolean;
  jpg?: boolean;
};

export type OutputFormat = 'webp' | 'png' | 'jpg';

export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';

export type SizePx = {
  width: number;
  height: number;
};

export type ProcessedImage = {
  file: File;
  dataUrl?: string;
  width: number;
  height: number;
  bytes: number;
  mime: string;
  aspect?: AspectRatio;
  sourceName?: string;
};

export type LoadedImage = {
  image: HTMLImageElement | ImageBitmap;
  width: number;
  height: number;
  mime: string;
  bytes: number;
  fileName?: string;
  objectUrl?: string;
};
