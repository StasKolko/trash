import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/shared/api/db";
import {
  effectivePrices,
  prices,
  productVariants,
} from "@/shared/api/db/schemas/catalog";

export type DiscountType = "none" | "percent" | "fixed" | "special";

type PriceRow = typeof prices.$inferSelect;

/**
 * Вычисляет эффективную цену по одной записи price.
 * Правила упрощённые:
 * - discount_type = none: price_cents_effective = base_price_cents
 * - discount_type = percent: base_price_cents * (1 - discount_value/100)
 * - discount_type = fixed: base_price_cents - discount_value
 * - discount_type = special: трактуем как фиксированную новую цену (discount_value как новая цена)
 */
function computeEffectiveFromRow(row: PriceRow) {
  const base = row.basePriceCents;
  const type = (row.discountType as DiscountType) ?? "none";
  const rawValue = row.discountValue ?? 0;
  const discountValueNumber = Number(rawValue);

  let priceEffective = base;
  let comparedAt: number | null = null;
  let discountPercent: number | null = null;

  switch (type) {
    case "none": {
      priceEffective = base;
      comparedAt = null;
      discountPercent = null;
      break;
    }
    case "percent": {
      const pct = Math.max(0, Math.min(100, discountValueNumber));
      const discounted = base * (1 - pct / 100);
      priceEffective = Math.max(0, Math.round(discounted));
      comparedAt = base;
      discountPercent = pct;
      break;
    }
    case "fixed": {
      const diff = Math.max(0, Math.round(discountValueNumber));
      const discounted = base - diff;
      priceEffective = Math.max(0, discounted);
      comparedAt = base;
      if (base > 0) {
        discountPercent = Math.min(
          100,
          Math.max(0, Math.round(((base - priceEffective) / base) * 100)),
        );
      } else {
        discountPercent = null;
      }
      break;
    }
    case "special": {
      const newPrice = Math.max(0, Math.round(discountValueNumber));
      comparedAt = base > 0 ? base : null;
      priceEffective = newPrice;
      if (comparedAt && comparedAt > 0) {
        discountPercent = Math.min(
          100,
          Math.max(
            0,
            Math.round(((comparedAt - priceEffective) / comparedAt) * 100),
          ),
        );
      } else {
        discountPercent = null;
      }
      break;
    }
    default: {
      priceEffective = base;
      comparedAt = null;
      discountPercent = null;
      break;
    }
  }

  return {
    priceCentsEffective: priceEffective,
    comparedAtPriceCents: comparedAt,
    discountPercent,
  };
}

/**
 * Находит актуальную запись price для варианта:
 * - variant_id = variantId
 * - valid_from <= now
 * - (valid_to IS NULL OR valid_to > now)
 * - выбирает самую "свежую" по valid_from/created_at
 */
async function findCurrentPriceRow(
  variantId: string,
): Promise<PriceRow | null> {
  const now = new Date();

  const rows = await db
    .select()
    .from(prices)
    .where(
      and(
        eq(prices.variantId, variantId),
        // valid_from <= now
        sql`"${prices.validFrom.name}" <= ${now}`,
        // valid_to IS NULL OR valid_to > now
        sql`(${prices.validTo.name} IS NULL OR "${prices.validTo.name}" > ${now})`,
      ),
    )
    .orderBy(desc(prices.validFrom), desc(prices.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Пересчитать effective_price для одного варианта.
 * Если актуальная price не найдена — можно:
 * - удалить строку из effective_price (вариант "без цены"),
 * - либо fallback к snapshot из product_variant.
 *
 * В этом helper'е возвращаем:
 * - true, если в итоге есть актуальная цена;
 * - false, если цену удалить (нет price и snapshot'а).
 */
export async function recomputeEffectivePriceForVariant(
  variantId: string,
): Promise<boolean> {
  // 1. Пробуем найти актуальную price
  const priceRow = await findCurrentPriceRow(variantId);

  if (priceRow) {
    const { priceCentsEffective, comparedAtPriceCents, discountPercent } =
      computeEffectiveFromRow(priceRow);

    await db
      .insert(effectivePrices)
      .values({
        variantId,
        priceCentsEffective,
        comparedAtPriceCents,
        // numeric в схеме, поэтому приводим к строке или null
        discountPercent:
          discountPercent == null ? null : discountPercent.toString(),
      })
      .onConflictDoUpdate({
        target: effectivePrices.variantId,
        set: {
          priceCentsEffective,
          comparedAtPriceCents,
          discountPercent:
            discountPercent == null ? null : discountPercent.toString(),
          updatedAt: new Date(),
        },
      });

    return true;
  }

  // 2. Фолбэк: используем snapshot из product_variant, если он есть
  const [variant] = await db
    .select({
      snapshot: productVariants.priceCentsSnapshot,
      comparedAtSnapshot: productVariants.comparedAtPriceCentsSnapshot,
      discountSnapshot: productVariants.discountPercentSnapshot,
    })
    .from(productVariants)
    .where(eq(productVariants.id, variantId))
    .limit(1);

  if (!variant || variant.snapshot == null) {
    // Нет ни price, ни snapshot → чистим effective_price
    await db
      .delete(effectivePrices)
      .where(eq(effectivePrices.variantId, variantId));
    return false;
  }

  await db
    .insert(effectivePrices)
    .values({
      variantId,
      priceCentsEffective: variant.snapshot,
      comparedAtPriceCents: variant.comparedAtSnapshot ?? null,
      discountPercent:
        variant.discountSnapshot == null
          ? null
          : Number(variant.discountSnapshot).toString(),
    })
    .onConflictDoUpdate({
      target: effectivePrices.variantId,
      set: {
        priceCentsEffective: variant.snapshot,
        comparedAtPriceCents: variant.comparedAtSnapshot ?? null,
        discountPercent:
          variant.discountSnapshot == null
            ? null
            : Number(variant.discountSnapshot).toString(),
        updatedAt: new Date(),
      },
    });

  return true;
}
