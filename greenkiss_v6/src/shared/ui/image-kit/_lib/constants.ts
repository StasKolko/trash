import type { AllowedExtensions, AspectPreset } from "./types";

export const DEFAULT_ALLOWED_EXTENSIONS: AllowedExtensions = {
  png: true,
  webp: true,
  jpeg: true,
  jpg: true,
};

export const BASIC_ASPECTS: AspectPreset[] = [
  { id: "1_1", label: "1:1", ratio: 1, kind: "basic" },
  { id: "3_4", label: "3:4", ratio: 3 / 4, kind: "basic" },
  { id: "4_3", label: "4:3", ratio: 4 / 3, kind: "basic" },
  { id: "16_9", label: "16:9", ratio: 16 / 9, kind: "basic" },
  { id: "9_16", label: "9:16", ratio: 9 / 16, kind: "basic" },
  { id: "21_9", label: "21:9", ratio: 21 / 9, kind: "basic" },
];

export const BANNER_ASPECTS: AspectPreset[] = [
  {
    id: "1920x480",
    label: "Баннер 1920×480",
    ratio: 1920 / 480,
    width: 1920,
    height: 480,
    kind: "banner",
  },
  {
    id: "2560x640",
    label: "Баннер 2560×640",
    ratio: 2560 / 640,
    width: 2560,
    height: 640,
    kind: "banner",
  },
  {
    id: "1200x300",
    label: "Баннер 1200×300",
    ratio: 1200 / 300,
    width: 1200,
    height: 300,
    kind: "banner",
  },
];

export const DEFAULT_MAX_DIALOG_PX = 1280;
export const DEFAULT_DONE_LABEL = "Готово";
export const DEFAULT_PROCESSING_LABEL = "Обработка...";

export const DEFAULT_WEIGHT_LIMITS = {
  maxBytes: 1_048_576,
  minBytes: 256,
} as const;

export const ASPECT_TOLERANCE = 0.005; // 0.5% допуска на сравнение аспектов
