import "server-only";

import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/shared/api/db";
import { categories, categoryClosure } from "@/shared/api/db/schemas/catalog";
import { createId } from "@/shared/lib/id";
import { transliterate } from "@/shared/lib/transliterate";
import {
  type CategoryNode,
  type CreateCategoryInput,
  createCategoryInputSchema,
} from "./categories-types";

// Новый slugify с транслитерацией RU → латиница
const SLUG_ALLOWED_CHARS_REGEX = /[^a-z0-9\s-]/g;
const WHITESPACE_REGEX = /\s+/g;
const DASHES_REGEX = /-+/g;

const MIN_SLUG_LENGTH = 3;

/**
 * Примеры:
 *  - "Мужчинам" → "muzhchinam"
 *  - "Женские пиджаки и жакеты" → "zhenskie-pidzhaki-i-zhakety"
 *  - "Женские джемперы, водолазки и кардиганы" → "zhenskie-dzhempery-vodolazki-i-kardigany"
 */
const slugify = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return "";

  // 1) Транслитерация кириллицы → латиница
  const transliterated = transliterate(trimmed);

  // 2) toLowerCase + очистка от недопустимых символов
  let slug = transliterated
    .toLowerCase()
    // оставить только латинские буквы, цифры, пробелы и дефисы
    .replace(SLUG_ALLOWED_CHARS_REGEX, "")
    // последовательности пробелов → один пробел
    .replace(WHITESPACE_REGEX, " ")
    .trim()
    // пробелы → дефисы
    .replace(/\s/g, "-")
    // несколько дефисов подряд → один дефис
    .replace(DASHES_REGEX, "-");

  // Убираем ведущие/замыкающие дефисы
  slug = slug.replace(/^-+/, "").replace(/-+$/, "");

  // Если после очистки мало символов — лучше сгенерировать по id
  if (slug.length < MIN_SLUG_LENGTH) {
    return "";
  }

  return slug;
};

async function computeSlugAndPath(name: string, parentId: string | null) {
  // ВАЖНО: slugify может вернуть "" если получилось мало значимых символов,
  // тогда нижеfallback на createId()
  const baseSlugRaw = slugify(name);
  const baseSlug = baseSlugRaw || createId().slice(0, 8);
  let slug = baseSlug;

  if (parentId) {
    // slug уникален среди братьев (одинаковый parentId)
    const siblings = await db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.parentId, parentId));

    const existing = new Set(siblings.map((s) => s.slug));
    let suffix = 2;
    while (existing.has(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const [parent] = await db
      .select({ fullPath: categories.fullPath, level: categories.level })
      .from(categories)
      .where(eq(categories.id, parentId))
      .limit(1);

    if (!parent) throw new Error("Parent category not found");

    return {
      slug,
      fullPath: `${parent.fullPath}/${slug}`,
      level: parent.level + 1,
    };
  }

  // Корневая категория: slug уникален среди root (parentId IS NULL)
  const siblings = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(isNull(categories.parentId));

  const existing = new Set(siblings.map((s) => s.slug));
  let suffix = 2;
  while (existing.has(slug)) {
    slug = `${baseSlug}-${suffix++}`;
  }

  return {
    slug,
    fullPath: slug,
    level: 0,
  };
}

export async function createCategory(input: CreateCategoryInput) {
  const data = createCategoryInputSchema.parse(input);

  return await db.transaction(async (tx) => {
    const { slug, fullPath, level } = await computeSlugAndPath(
      data.name,
      data.parentId ?? null,
    );

    const id = createId();

    const [inserted] = await tx
      .insert(categories)
      .values({
        id,
        name: data.name,
        slug,
        fullPath,
        parentId: data.parentId ?? null,
        status: data.status,
        sortOrder: data.sortOrder,
        level,
        description: data.description ?? null,
        metaTitle: data.metaTitle ?? data.name,
        metaDescription: data.metaDescription ?? null,
        ogTitle: data.ogTitle ?? data.name,
        ogDescription: data.ogDescription ?? null,
      })
      .returning();

    await tx.insert(categoryClosure).values({
      ancestorId: id,
      descendantId: id,
      depth: 0,
    });

    if (data.parentId) {
      const ancestors = await tx
        .select({
          ancestorId: categoryClosure.ancestorId,
          depth: categoryClosure.depth,
        })
        .from(categoryClosure)
        .where(eq(categoryClosure.descendantId, data.parentId));

      if (ancestors.length) {
        await tx.insert(categoryClosure).values(
          ancestors.map((a) => ({
            ancestorId: a.ancestorId,
            descendantId: id,
            depth: a.depth + 1,
          })),
        );
      }
    }

    return inserted;
  });
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      fullPath: categories.fullPath,
      level: categories.level,
      status: categories.status,
      sortOrder: categories.sortOrder,
      parentId: categories.parentId,
    })
    .from(categories)
    .orderBy(
      asc(categories.level),
      asc(categories.sortOrder),
      asc(categories.name),
    );

  const byId = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const row of rows) {
    byId.set(row.id, { ...row, children: [] });
  }

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function sortRec(nodes: CategoryNode[]): void {
    nodes.sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    );
    for (const n of nodes) {
      sortRec(n.children);
    }
  }

  sortRec(roots);
  return roots;
}

// Переэкспорт схемы, если нужно использовать её на сервере
export { createCategoryInputSchema } from "./categories-types";
