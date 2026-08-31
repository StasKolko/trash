export type ContentType = (typeof CONTENT_TYPES)[number];
export type Orientation = (typeof ORIENTATIONS)[number];
export type PresenterFormat = (typeof PRESENTER_FORMATS)[number];

export const CONTENT_TYPES = ["video", "post", "audio"] as const;
export const ORIENTATIONS = ["vertical", "horizontal"] as const;
export const PRESENTER_FORMATS = [
  "cropped",
  "background_removed",
  "original",
] as const;
