import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createId } from "@/shared/lib/id";
import { categories, products } from "./catalog";

// Вводим enum статуса бренда
export const brandStatusEnum = pgEnum("brand_status", [
  "active",
  "hidden",
  "archived",
]);

export const brands = pgTable("brand", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  imageAssetId: text("image_asset_id"),
  status: brandStatusEnum("status").notNull().default("active"),
  isTest: boolean("is_test").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: false }),
});

export const brandCategoryCounts = pgTable(
  "brand_category_counts",
  {
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    count: integer("count").notNull().default(0),
    lastRecalcAt: timestamp("last_recalc_at", {
      mode: "date",
      withTimezone: false,
    }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      name: "brand_category_counts_pk",
      columns: [table.brandId, table.categoryId],
    }),
  }),
);

// Простая связь product → brand (оставляем здесь, чтобы не трогать остальные файлы)
export const productBrandRelation = products;
