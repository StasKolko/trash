import "server-only";

import { and, asc, eq, ilike, isNull, type SQL } from "drizzle-orm";
import { db } from "@/shared/api/db";
import { attributes } from "@/shared/api/db/schemas/catalog";
import { createId } from "@/shared/lib/id";
import {
  type AttributeListItem,
  type CreateAttributeInput,
  createAttributeInputSchema,
  type UpdateAttributeInput,
  updateAttributeInputSchema,
} from "./attributes-types";

export async function createAttribute(raw: CreateAttributeInput) {
  const data = createAttributeInputSchema.parse(raw);

  const [inserted] = await db
    .insert(attributes)
    .values({
      id: createId(),
      code: data.code.trim().toLowerCase(),
      name: data.name.trim(),
      type: data.type,
      isVariational: data.isVariational,
      hasImages: data.hasImages,
      unit: data.unit ?? null,
    })
    .returning();

  return inserted;
}

export async function updateAttribute(raw: UpdateAttributeInput) {
  const data = updateAttributeInputSchema.parse(raw);

  const [updated] = await db
    .update(attributes)
    .set({
      code: data.code.trim().toLowerCase(),
      name: data.name.trim(),
      type: data.type,
      isVariational: data.isVariational,
      hasImages: data.hasImages,
      unit: data.unit ?? null,
      updatedAt: new Date(),
    })
    .where(eq(attributes.id, data.id))
    .returning();

  return updated;
}

export async function softDeleteAttribute(id: string) {
  const [updated] = await db
    .update(attributes)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(attributes.id, id), isNull(attributes.deletedAt)))
    .returning();

  return updated;
}

export async function restoreAttribute(id: string) {
  const [updated] = await db
    .update(attributes)
    .set({
      deletedAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(attributes.id, id), isNull(attributes.deletedAt)))
    .returning();

  return updated;
}

export async function listAttributes(params?: {
  search?: string;
  includeDeleted?: boolean;
}): Promise<AttributeListItem[]> {
  const whereClauses: SQL<unknown>[] = [];

  if (params?.search) {
    const q = `%${params.search.trim()}%`;
    // ilike возвращает SQL<unknown>, поэтому можно спокойно пушить оба выражения
    whereClauses.push(ilike(attributes.name, q));
    whereClauses.push(ilike(attributes.code, q));
  }

  if (!params?.includeDeleted) {
    whereClauses.push(isNull(attributes.deletedAt));
  }

  let whereExpr: SQL<unknown> | undefined;

  if (whereClauses.length === 0) {
    whereExpr = undefined;
  } else if (whereClauses.length === 1) {
    whereExpr = whereClauses[0];
  } else {
    whereExpr = and(...whereClauses);
  }

  const rows = await db
    .select()
    .from(attributes)
    .where(whereExpr)
    .orderBy(asc(attributes.name), asc(attributes.code));

  return rows as AttributeListItem[];
}
