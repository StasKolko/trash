export type ImageInputMode = "single" | "multiple";

export interface ImageAspectRatio {
  width: number;
  height: number;
}

export interface ImageInputProps {
  mode?: ImageInputMode;
  aspectRatio: ImageAspectRatio;
  onComplete: (images: File[]) => void;
}
