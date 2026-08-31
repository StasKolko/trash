import { Crop } from 'react-image-crop';

export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16' | '728:90' | '300:250' | '320:50';

export interface AspectRatioConfig {
  value: AspectRatio;
  label: string;
  ratio: number;
}

export interface AllowedFormats {
  png?: boolean;
  webp?: boolean;
  jpeg?: boolean;
  jpg?: boolean;
}

export interface ProcessedImage {
  id: string;
  originalFile: File;
  croppedImageUrl: string;
  crop: Crop;
  aspectRatio: AspectRatio;
}

export interface ImageCropperProps {
  multiple?: boolean;
  allowedFormats?: AllowedFormats;
  aspectRatio?: AspectRatio;
  onCropComplete: (images: ProcessedImage[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
  maxFileSize?: number; // в байтах
  minImageWidth?: number;
  minImageHeight?: number;
  quality?: number; // 0-1 для сжатия
  className?: string;
  triggerLabel?: string;
}

export interface ImageToCrop {
  id: string;
  file: File;
  imageUrl: string;
  crop: Crop;
  aspectRatio: AspectRatio;
}
