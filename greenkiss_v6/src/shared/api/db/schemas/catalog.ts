import {
  boolean,
  foreignKey,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createId } from "@/shared/lib/id";
import { brands } from "./brand";

export const categoryStatusEnum = pgEnum("category_status", [
  "draft",
  "active",
  "hidden",
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "hidden",
  "archived",
]);

// Новый enum для типа атрибута
export const attributeTypeEnum = pgEnum("attribute_type", [
  "string",
  "enum",
  "number",
  "range",
  "boolean",
  "multi_select",
]);

export const categories = pgTable(
  "category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    fullPath: text("full_path").notNull(),
    // ВАЖНО: без references здесь
    parentId: text("parent_id"),
    status: categoryStatusEnum("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    level: integer("level").notNull().default(0),
    description: text("description"),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    ogTitle: text("og_title"),
    ogDescription: text("og_description"),
    ogType: text("og_type").notNull().default("website"),
    metaRobots: text("meta_robots").notNull().default("index,follow"),
    canonicalUrl: text("canonical_url"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: false })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: false })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: false }),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "category_parent_fk",
    }).onDelete("set null"),
  ],
);

// дальше можно оставить как есть
export const categoryClosure = pgTable(
  "category_closure",
  {
    ancestorId: text("ancestor_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "cascade",
      }),
    descendantId: text("descendant_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "cascade",
      }),
    depth: integer("depth").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      name: "category_closure_pk",
      columns: [table.ancestorId, table.descendantId],
    }),
  }),
);

// ===== Новые таблицы атрибутов =====

export const attributes = pgTable("attribute", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  code: text("code").notNull(), // внутренний slug/код атрибута
  name: text("name").notNull(), // отображаемое название
  type: attributeTypeEnum("type").notNull().default("string"),
  isVariational: boolean("is_variational").notNull().default(false),
  hasImages: boolean("has_images").notNull().default(false),
  unit: text("unit"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: false }),
});

export const attributeValues = pgTable("attribute_value", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  attributeId: text("attribute_id")
    .notNull()
    .references(() => attributes.id, { onDelete: "cascade" }),
  valueNormalized: text("value_normalized").notNull(),
  label: text("label").notNull(),
  colorHex: text("color_hex"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: false }),
});

export const products = pgTable("product", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  brandId: text("brand_id").references(() => brands.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  status: productStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", {
    mode: "date",
    withTimezone: false,
  }),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogType: text("og_type").notNull().default("product"),
  metaRobots: text("meta_robots").notNull().default("index,follow"),
  canonicalUrl: text("canonical_url"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: false }),
});

export const productCategories = pgTable(
  "product_category",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").notNull().default(false),
  },
  (table) => ({
    pk: primaryKey({
      name: "product_category_pk",
      columns: [table.productId, table.categoryId],
    }),
  }),
);

export const productVariants = pgTable("product_variant", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  barcode: text("barcode"),
  isDefault: boolean("is_default").notNull().default(false),
  active: boolean("active").notNull().default(true),
  weightGrams: integer("weight_grams"),
  volumeCm3: integer("volume_cm3"),
  priceCentsSnapshot: integer("price_cents_snapshot"),
  comparedAtPriceCentsSnapshot: integer("compared_at_price_cents_snapshot"),
  discountPercentSnapshot: numeric("discount_percent_snapshot", {
    precision: 5,
    scale: 2,
  }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: false }),
});

// ===== Цены =====

export const prices = pgTable("price", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  variantId: text("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  basePriceCents: integer("base_price_cents").notNull(),
  discountType: text("discount_type").notNull().default("none"),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }),
  validFrom: timestamp("valid_from", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow(),
  validTo: timestamp("valid_to", { mode: "date", withTimezone: false }),
  meta: text("meta"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow(),
});

export const effectivePrices = pgTable("effective_price", {
  variantId: text("variant_id")
    .primaryKey()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  priceCentsEffective: integer("price_cents_effective").notNull(),
  comparedAtPriceCents: integer("compared_at_price_cents"),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: false })
    .notNull()
    .defaultNow(),
});
