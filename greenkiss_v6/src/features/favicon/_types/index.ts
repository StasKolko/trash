// src/features/favicon/_types/index.ts
export type FaviconVariantKey =
  | "original"
  | "favicon-32"
  | "favicon-96"
  | "apple-touch-icon"
  | "android-chrome-192"
  | "android-chrome-512";

export type VariantSpec =
  | { kind: "fixed"; size: number; maxBytes: number }
  | { kind: "range"; minSize: number; maxSize: number; maxBytes: number };

export type VariantsMap = Record<FaviconVariantKey, VariantSpec>;

export type GeneratedVariant = {
  key: FaviconVariantKey;
  filename: string;
  width: number;
  height: number;
  buffer: Buffer;
  bytes: number;
  contentType: "image/png";
  s3Key: string;
  cdnUrl: string;
};

export type FaviconRecord = {
  id: string;
  name: string;
  originalUrl: string;
  sizes: Record<
    string,
    {
      url: string;
      key: string;
      width: number;
      height: number;
      bytes: number;
      contentType: string;
    }
  >;
  isActive: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type FaviconSettingsDTO = {
  id: string;
  maxSizes: Record<string, { maxBytes: number }>;
  quality: number;
  updatedBy?: string | null;
  updatedAt: string;
};
