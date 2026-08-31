import "server-only";

import {
  type AnyColumn,
  and,
  asc,
  desc,
  eq,
  inArray,
  isNull,
  sql,
} from "drizzle-orm";
import type { SQL } from "drizzle-orm/sql";
import { db } from "@/shared/api/db";
import { brands } from "@/shared/api/db/schemas/brand";
import {
  categories,
  categoryClosure,
  effectivePrices,
  productCategories,
  productStatusEnum,
  products,
  productVariants,
} from "@/shared/api/db/schemas/catalog";
import type {
  CatalogProductListItem,
  CatalogProductListParams,
  CatalogProductListResult,
} from "./product-types";

// Временный placeholder для изображений, пока нет медиа-слоя
const FALLBACK_IMAGE_URL =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&auto=format&fit=crop";

// Находим id категории по её full_path (например, "odezhda/platya")
async function findCategoryIdByFullPath(
  fullPath: string | undefined,
): Promise<string | undefined> {
  if (!fullPath) return undefined;

  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.fullPath, fullPath), isNull(categories.deletedAt)))
    .limit(1);

  return row?.id;
}

/**
 * Возвращает список товаров для каталога.
 * На этом шаге:
 *  - Используем products + productVariants (+ brands).
 *  - Цена берётся из дефолтного варианта (is_default = true), если есть.
 *  - Если есть effective_price — она имеет приоритет над snapshot.
 *  - Фильтр по категории:
 *      - если задана categoryId, берём товары, привязанные к ней ИЛИ к её потомкам.
 */
export async function listProductsForCatalog(
  params: CatalogProductListParams & { categoryFullPath?: string } = {},
): Promise<CatalogProductListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(Math.max(1, params.pageSize ?? 24), 60);
  const offset = (page - 1) * pageSize;

  let categoryId = params.categoryId;

  if (!categoryId && params.categoryFullPath) {
    categoryId = await findCategoryIdByFullPath(params.categoryFullPath);
  }

  // Подзапрос для связи с категориями
  const productCategorySubquery = db
    .select({
      productId: productCategories.productId,
      categoryId: productCategories.categoryId,
    })
    .from(productCategories)
    .as("pc");

  // Если задана категория — ограничиваемся товарами из её поддерева.
  let categoryFilterExpr:
    | ReturnType<typeof inArray<typeof productCategorySubquery.categoryId>>
    | undefined;

  if (categoryId) {
    // Выберем все descendantId у ancestorId = categoryId
    const descendantIdsRows = await db
      .select({ id: categoryClosure.descendantId })
      .from(categoryClosure)
      .where(eq(categoryClosure.ancestorId, categoryId));

    const descendantIds = descendantIdsRows.map((r) => r.id);
    if (descendantIds.length > 0) {
      categoryFilterExpr = inArray(
        productCategorySubquery.categoryId,
        descendantIds,
      );
    }
  }

  // Базовый запрос — товары в статусе active, не удалённые
  // + join на brand
  const activeStatus =
    productStatusEnum.enumValues.find((v) => v === "active") ??
    productStatusEnum.enumValues[0];

  const baseWhere = and(
    eq(products.status, activeStatus),
    isNull(products.deletedAt),
  );

  // Подзапрос для дефолтного варианта на каждый продукт
  // + join с effective_price для приоритета
  const defaultVariantSubquery = db
    .select({
      productId: productVariants.productId,
      variantId: productVariants.id,
      // если есть effective_price, берём её, иначе snapshot
      priceCents: sql<
        number | null
      >`COALESCE(${effectivePrices.priceCentsEffective}, ${productVariants.priceCentsSnapshot})`,
      comparedAtPriceCents: sql<
        number | null
      >`COALESCE(${effectivePrices.comparedAtPriceCents}, ${productVariants.comparedAtPriceCentsSnapshot})`,
      discountPercent: sql<
        number | null
      >`COALESCE(${effectivePrices.discountPercent}, ${productVariants.discountPercentSnapshot})`,
    })
    .from(productVariants)
    .leftJoin(
      effectivePrices,
      eq(productVariants.id, effectivePrices.variantId),
    )
    .where(
      and(
        eq(productVariants.isDefault, true),
        isNull(productVariants.deletedAt),
      ),
    )
    .as("default_variant");

  // Для сортировки по цене — используем поля из дефолтного варианта
  // Корректный тип для orderBy в Drizzle: SQL | Column | Aliased
  type OrderByExpr =
    | SQL<unknown>
    | AnyColumn
    | { table: unknown; fieldAlias: string };

  let orderByExpr: OrderByExpr;

  switch (params.sort) {
    case "price_asc":
      orderByExpr = asc(sql`COALESCE("default_variant"."priceCents", 0)`);
      break;
    case "price_desc":
      orderByExpr = desc(sql`COALESCE("default_variant"."priceCents", 0)`);
      break;
    default:
      // "newest" и любые неизвестные значения
      orderByExpr = desc(products.createdAt);
      break;
  }

  // Подсчёт общего количества (без пагинации)
  const totalRows = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${products.id})`,
    })
    .from(products)
    .leftJoin(
      defaultVariantSubquery,
      eq(products.id, defaultVariantSubquery.productId),
    )
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(
      productCategorySubquery,
      eq(products.id, productCategorySubquery.productId),
    )
    .where(
      and(
        baseWhere,
        categoryFilterExpr ? (categoryFilterExpr as never) : sql`TRUE`,
      ),
    );

  const total = Number(totalRows[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (total === 0) {
    return {
      items: [],
      page,
      pageSize,
      total: 0,
      totalPages: 1,
    };
  }

  // Основной запрос с пагинацией
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      brandName: brands.name,
      priceCents: defaultVariantSubquery.priceCents,
      comparedAtPriceCents: defaultVariantSubquery.comparedAtPriceCents,
      discountPercent: defaultVariantSubquery.discountPercent,
    })
    .from(products)
    .leftJoin(
      defaultVariantSubquery,
      eq(products.id, defaultVariantSubquery.productId),
    )
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(
      productCategorySubquery,
      eq(products.id, productCategorySubquery.productId),
    )
    .where(
      and(
        baseWhere,
        categoryFilterExpr ? (categoryFilterExpr as never) : sql`TRUE`,
      ),
    )
    .groupBy(
      products.id,
      products.slug,
      products.name,
      brands.name,
      defaultVariantSubquery.priceCents,
      defaultVariantSubquery.comparedAtPriceCents,
      defaultVariantSubquery.discountPercent,
    )
    .orderBy(orderByExpr)
    .limit(pageSize)
    .offset(offset);

  const items: CatalogProductListItem[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    brandName: row.brandName ?? null,
    priceCents: row.priceCents ?? null,
    originalPriceCents: row.comparedAtPriceCents ?? null,
    discountPercent:
      row.discountPercent === null || row.discountPercent === undefined
        ? null
        : Number(row.discountPercent),
    imageUrl: FALLBACK_IMAGE_URL,
    rating: null,
    reviewsCount: null,
  }));

  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
  };
}
