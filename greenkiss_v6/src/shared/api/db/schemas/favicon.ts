import {
  boolean,
  integer,
  json,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export type FaviconSizeJson = {
  url: string;
  key: string;
  width: number;
  height: number;
  bytes: number;
  contentType: string;
};

export const favicon = pgTable("favicon", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  originalUrl: text("original_url").notNull(),

  sizes: json("sizes").$type<Record<string, FaviconSizeJson>>().notNull(),

  originalWidth: integer("original_width").notNull(),
  originalHeight: integer("original_height").notNull(),

  isActive: boolean("is_active").notNull().default(false),

  uploadedBy: text("uploaded_by").notNull(),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const faviconSettings = pgTable("favicon_settings", {
  id: text("id").primaryKey().default("default"),

  maxSizes: json("max_sizes")
    .$type<Record<string, { maxBytes: number }>>()
    .notNull(),

  quality: integer("quality").notNull().default(85),

  originalMinSize: integer("original_min_size").notNull().default(512),
  originalMaxSize: integer("original_max_size").notNull().default(1024),

  createdBy: text("created_by"),
  updatedBy: text("updated_by"),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});
