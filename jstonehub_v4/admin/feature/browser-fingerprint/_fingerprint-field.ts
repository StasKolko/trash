import type { BrowserFingerprintField } from "@packages/contract/browser-fingerprint";

import {
  BROWSER_COLOR_DEPTHS,
  BROWSER_DEVICE_MEMORIES,
  BROWSER_FINGERPRINT_LIMITS,
  BROWSER_PLATFORMS,
  BROWSER_VENDORS,
} from "@packages/contract/browser-fingerprint";

type FieldMeta = {
  key: BrowserFingerprintField;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "select" | "multi-text";
  options?: readonly (string | number)[];
  min?: number;
  max?: number;
  required: boolean;
};

const L = BROWSER_FINGERPRINT_LIMITS;

const FINGERPRINT_FIELDS: FieldMeta[] = [
  {
    key: "userAgent",
    label: "User Agent",
    type: "textarea",
    required: true,
    min: L.userAgent.min,
    max: L.userAgent.max,
  },
  {
    key: "platform",
    label: "Platform",
    type: "select",
    required: true,
    options: BROWSER_PLATFORMS,
  },
  {
    key: "language",
    label: "Language",
    type: "text",
    required: true,
    min: L.language.min,
    max: L.language.max,
  },
  { key: "languages", label: "Languages", type: "multi-text", required: true },
  {
    key: "screenWidth",
    label: "Screen Width",
    type: "number",
    required: true,
    min: L.screenWidth.min,
    max: L.screenWidth.max,
  },
  {
    key: "screenHeight",
    label: "Screen Height",
    type: "number",
    required: true,
    min: L.screenHeight.min,
    max: L.screenHeight.max,
  },
  {
    key: "colorDepth",
    label: "Color Depth",
    type: "select",
    required: true,
    options: BROWSER_COLOR_DEPTHS,
  },
  {
    key: "timezone",
    label: "Timezone",
    type: "text",
    required: true,
    min: L.timezone.min,
    max: L.timezone.max,
  },
  {
    key: "timezoneOffset",
    label: "Timezone Offset",
    type: "number",
    required: true,
    min: L.timezoneOffset.min,
    max: L.timezoneOffset.max,
  },
  {
    key: "hardwareConcurrency",
    label: "Hardware Concurrency",
    type: "number",
    required: true,
    min: L.hardwareConcurrency.min,
    max: L.hardwareConcurrency.max,
  },
  {
    key: "maxTouchPoints",
    label: "Max Touch Points",
    type: "number",
    required: true,
    min: L.maxTouchPoints.min,
    max: L.maxTouchPoints.max,
  },
  {
    key: "cookieEnabled",
    label: "Cookie Enabled",
    type: "boolean",
    required: true,
  },
  {
    key: "webglVendor",
    label: "WebGL Vendor",
    type: "text",
    required: true,
    min: L.webglVendor.min,
    max: L.webglVendor.max,
  },
  {
    key: "webglRenderer",
    label: "WebGL Renderer",
    type: "text",
    required: true,
    min: L.webglRenderer.min,
    max: L.webglRenderer.max,
  },
  {
    key: "availWidth",
    label: "Available Width",
    type: "number",
    required: true,
    min: L.availWidth.min,
    max: L.availWidth.max,
  },
  {
    key: "availHeight",
    label: "Available Height",
    type: "number",
    required: true,
    min: L.availHeight.min,
    max: L.availHeight.max,
  },
  {
    key: "pixelRatio",
    label: "Pixel Ratio",
    type: "number",
    required: true,
    min: L.pixelRatio.min,
    max: L.pixelRatio.max,
  },
  {
    key: "deviceMemory",
    label: "Device Memory",
    type: "select",
    required: false,
    options: BROWSER_DEVICE_MEMORIES,
  },
  {
    key: "doNotTrack",
    label: "Do Not Track",
    type: "text",
    required: false,
    min: L.doNotTrack.min,
    max: L.doNotTrack.max,
  },
  {
    key: "pdfViewerEnabled",
    label: "PDF Viewer Enabled",
    type: "boolean",
    required: true,
  },
  {
    key: "vendor",
    label: "Vendor",
    type: "select",
    required: true,
    options: BROWSER_VENDORS,
  },
  {
    key: "appVersion",
    label: "App Version",
    type: "textarea",
    required: true,
    min: L.appVersion.min,
    max: L.appVersion.max,
  },
];

export type { FieldMeta };
export { FINGERPRINT_FIELDS };
