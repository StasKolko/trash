type BrowserFingerprintStatus = (typeof BROWSER_FINGERPRINT_STATUSES)[number];
type BrowserFingerprintSort = (typeof BROWSER_FINGERPRINT_SORTS)[number];
type BrowserPlatform = (typeof BROWSER_PLATFORMS)[number];
type BrowserVendor = (typeof BROWSER_VENDORS)[number];
type BrowserColorDepth = (typeof BROWSER_COLOR_DEPTHS)[number];
type BrowserDeviceMemory = (typeof BROWSER_DEVICE_MEMORIES)[number];
type BrowserFingerprintField = (typeof BROWSER_FINGERPRINT_FIELDS)[number];

const CORE_FIELDS = [
  "userAgent",
  "platform",
  "language",
  "languages",
  "screenWidth",
  "screenHeight",
  "colorDepth",
  "timezone",
  "timezoneOffset",
] as const;

const EXTENDED_FIELDS = [
  "hardwareConcurrency",
  "maxTouchPoints",
  "cookieEnabled",
  "webglVendor",
  "webglRenderer",
  "availWidth",
  "availHeight",
  "pixelRatio",
] as const;

const OPTIONAL_FIELDS = [
  "deviceMemory",
  "doNotTrack",
  "pdfViewerEnabled",
  "vendor",
  "appVersion",
] as const;

const BROWSER_FINGERPRINT_STATUSES = ["active", "inactive"] as const;

const BROWSER_FINGERPRINT_SORTS = ["createdAt", "label"] as const;

const BROWSER_PLATFORMS = [
  "Win32",
  "Linux x86_64",
  "MacIntel",
  "Linux armv81",
] as const;

const BROWSER_VENDORS = ["Google Inc.", "Apple Computer, Inc.", ""] as const;

const BROWSER_COLOR_DEPTHS = [1, 4, 8, 15, 16, 24, 32, 48] as const;

const BROWSER_DEVICE_MEMORIES = [0.25, 0.5, 1, 2, 4, 8, 16, 32, 64] as const;

const BROWSER_FINGERPRINT_FIELDS = [
  ...CORE_FIELDS,
  ...EXTENDED_FIELDS,
  ...OPTIONAL_FIELDS,
] as const;

const BROWSER_FINGERPRINT_LIMITS = {
  label: { min: 8, max: 100 },
  userAgent: { min: 20, max: 512 },
  language: { min: 2, max: 10 },
  languages: { min: 1, max: 20 },
  timezone: { min: 3, max: 50 },
  webglVendor: { min: 3, max: 256 },
  webglRenderer: { min: 3, max: 256 },
  appVersion: { min: 10, max: 256 },
  doNotTrack: { min: 1, max: 5 },
  screenWidth: { min: 320, max: 7680 },
  screenHeight: { min: 240, max: 4320 },
  availWidth: { min: 320, max: 7680 },
  availHeight: { min: 240, max: 4320 },
  timezoneOffset: { min: -720, max: 840 },
  hardwareConcurrency: { min: 1, max: 128 },
  maxTouchPoints: { min: 0, max: 10 },
  pixelRatio: { min: 0.5, max: 5 },
} as const;

export type {
  BrowserColorDepth,
  BrowserDeviceMemory,
  BrowserFingerprintField,
  BrowserFingerprintSort,
  BrowserFingerprintStatus,
  BrowserPlatform,
  BrowserVendor,
};
export {
  BROWSER_COLOR_DEPTHS,
  BROWSER_DEVICE_MEMORIES,
  BROWSER_FINGERPRINT_FIELDS,
  BROWSER_FINGERPRINT_LIMITS,
  BROWSER_FINGERPRINT_SORTS,
  BROWSER_FINGERPRINT_STATUSES,
  BROWSER_PLATFORMS,
  BROWSER_VENDORS,
};
