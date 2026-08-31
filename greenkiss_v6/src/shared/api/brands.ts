// src/shared/api/brands.ts
import "server-only";

import { and, asc, desc, eq, ilike, isNull } from "drizzle-orm";
import { db } from "@/shared/api/db";
import { type brandStatusEnum, brands } from "@/shared/api/db/schemas/brand";
import { products } from "@/shared/api/db/schemas/catalog";
import { createId } from "@/shared/lib/id";
import {
  type BrandListItem,
  type CreateBrandInput,
  createBrandInputSchema,
  type UpdateBrandInput,
  updateBrandInputSchema,
} from "./brands-types";

// Для фильтра статуса
export type BrandStatusFilter = "all" | "active" | "hidden";

export async function createBrand(raw: CreateBrandInput) {
  const data = createBrandInputSchema.parse(raw);

  const [inserted] = await db
    .insert(brands)
    .values({
      id: createId(),
      name: data.name.trim(),
      imageAssetId: data.imageAssetId ?? null,
      status: data.status ?? "active",
      isTest: data.isTest ?? false,
    })
    .returning();

  return inserted;
}

export async function updateBrand(raw: UpdateBrandInput) {
  const data = updateBrandInputSchema.parse(raw);

  const [updated] = await db
    .update(brands)
    .set({
      name: data.name.trim(),
      imageAssetId: data.imageAssetId ?? null,
      status: data.status ?? "active",
      isTest: data.isTest ?? false,
      updatedAt: new Date(),
    })
    .where(eq(brands.id, data.id))
    .returning();

  return updated;
}

export async function softDeleteBrand(id: string) {
  const [updated] = await db
    .update(brands)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(brands.id, id), isNull(brands.deletedAt)))
    .returning();

  return updated;
}

export async function restoreBrand(id: string) {
  const [updated] = await db
    .update(brands)
    .set({
      deletedAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(brands.id, id), isNull(brands.deletedAt)))
    .returning();

  return updated;
}

export async function listBrands(params?: {
  search?: string;
  includeDeleted?: boolean;
  statusFilter?: BrandStatusFilter;
}): Promise<BrandListItem[]> {
  const whereClauses = [];

  if (params?.search) {
    whereClauses.push(ilike(brands.name, `%${params.search.trim()}%`));
  }

  if (!params?.includeDeleted) {
    whereClauses.push(isNull(brands.deletedAt));
  }

  if (params?.statusFilter && params.statusFilter !== "all") {
    // "active" | "hidden" → мапим на enum
    const targetStatus = params.statusFilter === "active" ? "active" : "hidden";
    whereClauses.push(
      eq(
        brands.status,
        targetStatus as (typeof brandStatusEnum.enumValues)[number],
      ),
    );
  }

  const whereExpr =
    whereClauses.length === 0
      ? undefined
      : whereClauses.length === 1
        ? whereClauses[0]
        : and(...whereClauses);

  const rows = await db
    .select()
    .from(brands)
    .where(whereExpr)
    .orderBy(asc(brands.name), desc(brands.createdAt));

  return rows as BrandListItem[];
}

// Для диалога удаления: список товаров бренда
export async function listProductsByBrand(brandId: string) {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
    })
    .from(products)
    .where(and(eq(products.brandId, brandId), isNull(products.deletedAt)))
    .orderBy(asc(products.name));

  return rows;
}

// Тестовые бренды

export async function createTestBrands(count: number) {
  const safeCount = Math.max(1, Math.min(count, 200));
  const now = new Date();

  const toInsert = Array.from({ length: safeCount }).map((_, i) => ({
    id: createId(),
    name: `Test Brand ${i + 1}`,
    imageAssetId: null,
    status: "active" as (typeof brandStatusEnum.enumValues)[number],
    isTest: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }));

  await db.insert(brands).values(toInsert);
}

export async function deleteAllTestBrands() {
  await db.delete(brands).where(eq(brands.isTest, true));
}
