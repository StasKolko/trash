type FingerprintPresetData = {
  userAgent: string;
  platform: "Win32" | "Linux x86_64" | "MacIntel" | "Linux armv81";
  language: string;
  languages: string[];
  screenWidth: number;
  screenHeight: number;
  colorDepth: 24 | 32;
  timezone: string;
  timezoneOffset: number;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  cookieEnabled: boolean;
  webglVendor: string;
  webglRenderer: string;
  availWidth: number;
  availHeight: number;
  pixelRatio: number;
  deviceMemory: number | null;
  doNotTrack: string | null;
  pdfViewerEnabled: boolean;
  vendor: "" | "Google Inc." | "Apple Computer, Inc.";
  appVersion: string;
};

type FingerprintPreset = {
  label: string;
  data: FingerprintPresetData;
};

const FINGERPRINT_PRESETS: FingerprintPreset[] = [
  {
    label: "Chrome 120 — Windows 10 (1080p)",
    data: {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      platform: "Win32",
      language: "en-US",
      languages: ["en-US", "en"],
      screenWidth: 1920,
      screenHeight: 1080,
      colorDepth: 24,
      timezone: "America/New_York",
      timezoneOffset: 300,
      hardwareConcurrency: 8,
      maxTouchPoints: 0,
      cookieEnabled: true,
      webglVendor: "Google Inc. (NVIDIA)",
      webglRenderer:
        "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)",
      availWidth: 1920,
      availHeight: 1040,
      pixelRatio: 1,
      deviceMemory: 8,
      doNotTrack: null,
      pdfViewerEnabled: true,
      vendor: "Google Inc.",
      appVersion:
        "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  },
  {
    label: "Chrome 120 — macOS Sonoma (Retina)",
    data: {
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      platform: "MacIntel",
      language: "en-US",
      languages: ["en-US", "en"],
      screenWidth: 2560,
      screenHeight: 1440,
      colorDepth: 24,
      timezone: "America/Los_Angeles",
      timezoneOffset: 480,
      hardwareConcurrency: 10,
      maxTouchPoints: 0,
      cookieEnabled: true,
      webglVendor: "Google Inc. (Apple)",
      webglRenderer: "ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)",
      availWidth: 2560,
      availHeight: 1415,
      pixelRatio: 2,
      deviceMemory: 8,
      doNotTrack: null,
      pdfViewerEnabled: true,
      vendor: "Google Inc.",
      appVersion:
        "5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  },
  {
    label: "Firefox 121 — Ubuntu Linux (1080p)",
    data: {
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
      platform: "Linux x86_64",
      language: "en-US",
      languages: ["en-US", "en"],
      screenWidth: 1920,
      screenHeight: 1080,
      colorDepth: 24,
      timezone: "Europe/London",
      timezoneOffset: 0,
      hardwareConcurrency: 12,
      maxTouchPoints: 0,
      cookieEnabled: true,
      webglVendor: "Mozilla",
      webglRenderer: "Mesa Intel(R) UHD Graphics 630 (CFL GT2)",
      availWidth: 1920,
      availHeight: 1053,
      pixelRatio: 1,
      deviceMemory: null,
      doNotTrack: "1",
      pdfViewerEnabled: true,
      vendor: "",
      appVersion: "5.0 (X11)",
    },
  },
  {
    label: "Chrome 120 — Windows 11 (1440p)",
    data: {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      platform: "Win32",
      language: "ru-RU",
      languages: ["ru-RU", "ru", "en-US", "en"],
      screenWidth: 2560,
      screenHeight: 1440,
      colorDepth: 24,
      timezone: "Europe/Moscow",
      timezoneOffset: -180,
      hardwareConcurrency: 16,
      maxTouchPoints: 0,
      cookieEnabled: true,
      webglVendor: "Google Inc. (NVIDIA)",
      webglRenderer:
        "ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0, D3D11)",
      availWidth: 2560,
      availHeight: 1400,
      pixelRatio: 1,
      deviceMemory: 16,
      doNotTrack: null,
      pdfViewerEnabled: true,
      vendor: "Google Inc.",
      appVersion:
        "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  },
];

export type { FingerprintPreset, FingerprintPresetData };
export { FINGERPRINT_PRESETS };
