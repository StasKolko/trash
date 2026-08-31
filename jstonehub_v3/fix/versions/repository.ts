import type {
  NewSecretVoicerVersion,
  SecretVoicerVersion,
  UpdateSecretVoicerVersion,
  VersionType,
} from "./types";

import { and, eq, inArray, lt, or } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { secretVoicerVersionTable } from "./table";

const MS_PER_MINUTE = 60_000;

export const secretVoicerVersionRepository = {
  getByItemId(itemId: string): Promise<SecretVoicerVersion[]> {
    return db
      .select()
      .from(secretVoicerVersionTable)
      .where(eq(secretVoicerVersionTable.itemId, itemId));
  },

  async getByItemIdAndType(
    itemId: string,
    versionType: VersionType,
  ): Promise<SecretVoicerVersion | null> {
    const [result] = await db
      .select()
      .from(secretVoicerVersionTable)
      .where(
        and(
          eq(secretVoicerVersionTable.itemId, itemId),
          eq(secretVoicerVersionTable.versionType, versionType),
        ),
      )
      .limit(1);
    return result ?? null;
  },

  async getById(id: string): Promise<SecretVoicerVersion | null> {
    const [result] = await db
      .select()
      .from(secretVoicerVersionTable)
      .where(eq(secretVoicerVersionTable.id, id))
      .limit(1);
    return result ?? null;
  },

  async create(data: NewSecretVoicerVersion): Promise<SecretVoicerVersion> {
    const [result] = await db
      .insert(secretVoicerVersionTable)
      .values(data)
      .returning();

    if (!result) {
      throw new Error("Failed to create version");
    }

    return result;
  },

  createMany(data: NewSecretVoicerVersion[]): Promise<SecretVoicerVersion[]> {
    return db.insert(secretVoicerVersionTable).values(data).returning();
  },

  async update(
    id: string,
    data: UpdateSecretVoicerVersion,
  ): Promise<SecretVoicerVersion | null> {
    const [result] = await db
      .update(secretVoicerVersionTable)
      .set(data)
      .where(eq(secretVoicerVersionTable.id, id))
      .returning();
    return result ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(secretVoicerVersionTable)
      .where(eq(secretVoicerVersionTable.id, id))
      .returning({ id: secretVoicerVersionTable.id });
    return result.length > 0;
  },

  deleteByItemIdAndType(
    itemId: string,
    versionType: VersionType,
  ): Promise<SecretVoicerVersion[]> {
    return db
      .delete(secretVoicerVersionTable)
      .where(
        and(
          eq(secretVoicerVersionTable.itemId, itemId),
          eq(secretVoicerVersionTable.versionType, versionType),
        ),
      )
      .returning();
  },

  getPendingForPolling(): Promise<SecretVoicerVersion[]> {
    return db
      .select()
      .from(secretVoicerVersionTable)
      .where(
        or(
          eq(secretVoicerVersionTable.externalStatus, "pending"),
          eq(secretVoicerVersionTable.externalStatus, "processing"),
        ),
      );
  },

  getTimedOut(timeoutMinutes: number): Promise<SecretVoicerVersion[]> {
    const timeoutDate = new Date(Date.now() - timeoutMinutes * MS_PER_MINUTE);

    return db
      .select()
      .from(secretVoicerVersionTable)
      .where(
        and(
          or(
            eq(secretVoicerVersionTable.externalStatus, "pending"),
            eq(secretVoicerVersionTable.externalStatus, "processing"),
          ),
          lt(secretVoicerVersionTable.createdAt, timeoutDate),
        ),
      );
  },

  getByItemIds(itemIds: string[]): Promise<SecretVoicerVersion[]> {
    return db
      .select()
      .from(secretVoicerVersionTable)
      .where(inArray(secretVoicerVersionTable.itemId, itemIds));
  },
};
