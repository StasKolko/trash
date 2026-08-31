import type { InferSelectModel } from "drizzle-orm";

import { asc, eq } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { tagsTable } from "./tag.table";

type Tag = InferSelectModel<typeof tagsTable>;

const tagRepository = {
  getAll(): Promise<Tag[]> {
    return db.select().from(tagsTable).orderBy(asc(tagsTable.name));
  },

  async getBySlug(slug: string): Promise<Tag | null> {
    const [row] = await db
      .select()
      .from(tagsTable)
      .where(eq(tagsTable.slug, slug))
      .limit(1);
    return row ?? null;
  },

  async create(data: { slug: string; name: string }): Promise<Tag> {
    const [row] = await db.insert(tagsTable).values(data).returning();
    if (!row) {
      throw new Error("Failed to create tag");
    }
    return row;
  },

  async update(
    id: string,
    data: Partial<{ slug: string; name: string }>,
  ): Promise<Tag | null> {
    const [row] = await db
      .update(tagsTable)
      .set(data)
      .where(eq(tagsTable.id, id))
      .returning();
    return row ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const rows = await db
      .delete(tagsTable)
      .where(eq(tagsTable.id, id))
      .returning({ id: tagsTable.id });
    return rows.length > 0;
  },
};

export type { Tag };
export { tagRepository };
