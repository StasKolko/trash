import {
  BROWSER_PLATFORMS,
  BROWSER_VENDORS,
} from "@packages/contract/browser-fingerprint";
import { createId } from "@packages/util/id";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const browserPlatformEnum = pgEnum(
  "browser_platform",
  BROWSER_PLATFORMS,
);
export const browserVendorEnum = pgEnum("browser_vendor", BROWSER_VENDORS);

export const browserFingerprintsTable = pgTable("browser_fingerprints", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  label: text("label").notNull(),
  isActive: boolean("is_active").notNull().default(true),

  // Core fields
  userAgent: text("user_agent").notNull(),
  platform: browserPlatformEnum("platform").notNull(),
  language: text("language").notNull(),
  languages: text("languages").array().notNull(),
  screenWidth: integer("screen_width").notNull(),
  screenHeight: integer("screen_height").notNull(),
  colorDepth: integer("color_depth").notNull(),
  timezone: text("timezone").notNull(),
  timezoneOffset: integer("timezone_offset").notNull(),

  // Extended fields
  hardwareConcurrency: integer("hardware_concurrency").notNull(),
  maxTouchPoints: integer("max_touch_points").notNull(),
  cookieEnabled: boolean("cookie_enabled").notNull(),
  webglVendor: text("webgl_vendor").notNull(),
  webglRenderer: text("webgl_renderer").notNull(),
  availWidth: integer("avail_width").notNull(),
  availHeight: integer("avail_height").notNull(),
  pixelRatio: real("pixel_ratio").notNull(),

  // Optional fields
  deviceMemory: real("device_memory"),
  doNotTrack: text("do_not_track"),
  pdfViewerEnabled: boolean("pdf_viewer_enabled").notNull(),
  vendor: browserVendorEnum("vendor").notNull(),
  appVersion: text("app_version").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
