export type OutputFormat = "webp" | "png" | "jpg" | "jpeg";

export type AspectOption = "1:1" | "3:4" | "4:3" | "16:9" | "9:16";

export type ImageErrorCode =
  | "INVALID_EXTENSION"
  | "MIN_WIDTH"
  | "MIN_HEIGHT"
  | "MIN_SIZE"
  | "TOO_MANY_FILES"
  | "LOAD_FAILED";

export interface ImageError {
  code: ImageErrorCode;
  message: string;
  fileName?: string;
}

export interface TargetResolution {
  width: number;
  height: number;
}

export interface ProcessedImage {
  id: string;
  file: File;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
  mime: string;
  originalFileName: string;
  ext: OutputFormat;
}

export interface ImageCropperProps {
  allowedExtensions?: OutputFormat[]; // default: ["webp","png","jpg","jpeg"]
  maxCount?: number; // default: 1
  targetExtension?: OutputFormat | null; // default: null (сохранять исходное)
  aspect?: AspectOption; // default: "1:1"
  targetResolution?: TargetResolution | null; // default: null (не менять)
  minWidth?: number | null; // default: null
  minHeight?: number | null; // default: null
  minBytes?: number | null; // default: null
  maxBytes?: number | null; // default: null (сжимать до)
  onChange?: (processed: ProcessedImage[]) => void;
  onError?: (errors: ImageError[]) => void;
  className?: string;
  labels?: {
    pickFiles?: string;
    orDropHere?: string;
    cropTitle?: string;
    cancel?: string;
    apply?: string;
    remove?: string;
    edit?: string;
    done?: string;
    compressing?: string;
    maxBytesInfo?: (kb: string) => string;
  };
}
