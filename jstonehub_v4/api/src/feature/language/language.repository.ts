import type { InferSelectModel } from "drizzle-orm";

import { asc, eq } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { languagesTable } from "./language.table";

type Language = InferSelectModel<typeof languagesTable>;

const languageRepository = {
  getAll(): Promise<Language[]> {
    return db.select().from(languagesTable).orderBy(asc(languagesTable.name));
  },

  async getByCode(code: string): Promise<Language | null> {
    const [row] = await db
      .select()
      .from(languagesTable)
      .where(eq(languagesTable.code, code))
      .limit(1);
    return row ?? null;
  },

  async create(data: { code: string; name: string }): Promise<Language> {
    const [row] = await db.insert(languagesTable).values(data).returning();
    if (!row) {
      throw new Error("Failed to create language");
    }
    return row;
  },

  async update(
    id: string,
    data: Partial<{ name: string; isActive: boolean }>,
  ): Promise<Language | null> {
    const [row] = await db
      .update(languagesTable)
      .set(data)
      .where(eq(languagesTable.id, id))
      .returning();
    return row ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const rows = await db
      .delete(languagesTable)
      .where(eq(languagesTable.id, id))
      .returning({ id: languagesTable.id });
    return rows.length > 0;
  },
};

export type { Language };
export { languageRepository };
