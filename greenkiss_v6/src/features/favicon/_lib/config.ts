import type { VariantsMap } from "../_types";

export const FAVICON_PREFIX = "branding/favicons";

export const VARIANTS: VariantsMap = {
  original: { kind: "range", minSize: 512, maxSize: 1024, maxBytes: 32_768 },
  "favicon-32": { kind: "fixed", size: 32, maxBytes: 1_024 },
  "favicon-96": { kind: "fixed", size: 96, maxBytes: 3_072 },
  "apple-touch-icon": { kind: "fixed", size: 180, maxBytes: 6_144 },
  "android-chrome-192": { kind: "fixed", size: 192, maxBytes: 6_144 },
  "android-chrome-512": { kind: "fixed", size: 512, maxBytes: 16_384 },
};

export function variantFilename(
  key: keyof typeof VARIANTS,
  _w: number,
  _h: number,
) {
  switch (key) {
    case "original":
      return "original.png";
    case "favicon-32":
      return "favicon-32x32.png";
    case "favicon-96":
      return "favicon-96x96.png";
    case "apple-touch-icon":
      return "apple-touch-icon-180x180.png";
    case "android-chrome-192":
      return "android-chrome-192x192.png";
    case "android-chrome-512":
      return "android-chrome-512x512.png";
  }
}
