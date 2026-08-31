import {
  BROWSER_COLOR_DEPTHS,
  BROWSER_DEVICE_MEMORIES,
  BROWSER_FINGERPRINT_LIMITS,
  BROWSER_FINGERPRINT_SORTS,
  BROWSER_FINGERPRINT_STATUSES,
  BROWSER_PLATFORMS,
  BROWSER_VENDORS,
} from "@packages/contract/browser-fingerprint";
import { createQueryParamsSchema } from "@packages/contract/pagination";
import { Type } from "typebox";
import { Compile } from "typebox/compile";

const L = BROWSER_FINGERPRINT_LIMITS;

const createBrowserFingerprintSchema = Type.Object({
  label: Type.String({ minLength: L.label.min, maxLength: L.label.max }),
  userAgent: Type.String({
    minLength: L.userAgent.min,
    maxLength: L.userAgent.max,
  }),
  platform: Type.Union(BROWSER_PLATFORMS.map((v) => Type.Literal(v))),
  language: Type.String({
    minLength: L.language.min,
    maxLength: L.language.max,
  }),
  languages: Type.Array(
    Type.String({ minLength: L.language.min, maxLength: L.language.max }),
    { minItems: L.languages.min, maxItems: L.languages.max },
  ),
  screenWidth: Type.Integer({
    minimum: L.screenWidth.min,
    maximum: L.screenWidth.max,
  }),
  screenHeight: Type.Integer({
    minimum: L.screenHeight.min,
    maximum: L.screenHeight.max,
  }),
  colorDepth: Type.Union(BROWSER_COLOR_DEPTHS.map((v) => Type.Literal(v))),
  timezone: Type.String({
    minLength: L.timezone.min,
    maxLength: L.timezone.max,
  }),
  timezoneOffset: Type.Integer({
    minimum: L.timezoneOffset.min,
    maximum: L.timezoneOffset.max,
  }),
  hardwareConcurrency: Type.Integer({
    minimum: L.hardwareConcurrency.min,
    maximum: L.hardwareConcurrency.max,
  }),
  maxTouchPoints: Type.Integer({
    minimum: L.maxTouchPoints.min,
    maximum: L.maxTouchPoints.max,
  }),
  cookieEnabled: Type.Boolean(),
  webglVendor: Type.String({
    minLength: L.webglVendor.min,
    maxLength: L.webglVendor.max,
  }),
  webglRenderer: Type.String({
    minLength: L.webglRenderer.min,
    maxLength: L.webglRenderer.max,
  }),
  availWidth: Type.Integer({
    minimum: L.availWidth.min,
    maximum: L.availWidth.max,
  }),
  availHeight: Type.Integer({
    minimum: L.availHeight.min,
    maximum: L.availHeight.max,
  }),
  pixelRatio: Type.Number({
    minimum: L.pixelRatio.min,
    maximum: L.pixelRatio.max,
  }),
  deviceMemory: Type.Optional(
    Type.Union([
      Type.Null(),
      Type.Union(BROWSER_DEVICE_MEMORIES.map((v) => Type.Literal(v))),
    ]),
  ),
  doNotTrack: Type.Optional(
    Type.Union([
      Type.Null(),
      Type.String({ minLength: L.doNotTrack.min, maxLength: L.doNotTrack.max }),
    ]),
  ),
  pdfViewerEnabled: Type.Boolean(),
  vendor: Type.Union(BROWSER_VENDORS.map((v) => Type.Literal(v))),
  appVersion: Type.String({
    minLength: L.appVersion.min,
    maxLength: L.appVersion.max,
  }),
});

const updateBrowserFingerprintSchema = Type.Partial(
  Type.Object({
    ...createBrowserFingerprintSchema.properties,
    isActive: Type.Boolean(),
  }),
);

const getBrowserFingerprintsQuerySchema = createQueryParamsSchema({
  mode: "all",
  sorts: BROWSER_FINGERPRINT_SORTS,
  filters: {
    status: { values: BROWSER_FINGERPRINT_STATUSES },
  },
});

export const createBrowserFingerprintValidator = Compile(
  createBrowserFingerprintSchema,
);
export const updateBrowserFingerprintValidator = Compile(
  updateBrowserFingerprintSchema,
);
export const getBrowserFingerprintsQueryValidator = Compile(
  getBrowserFingerprintsQuerySchema,
);
