// apps/api/src/features/secret-voicer/items/repository.ts

import type {
  ItemStatus,
  NewSecretVoicerItem,
  SecretVoicerItem,
  UpdateSecretVoicerItem,
} from "./types";

import { eq, inArray } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { secretVoicerItemTable } from "./table";

export const secretVoicerItemRepository = {
  getByProjectId(projectId: string): Promise<SecretVoicerItem[]> {
    return db
      .select()
      .from(secretVoicerItemTable)
      .where(eq(secretVoicerItemTable.projectId, projectId))
      .orderBy(secretVoicerItemTable.orderIndex);
  },

  async getById(id: string): Promise<SecretVoicerItem | null> {
    const [result] = await db
      .select()
      .from(secretVoicerItemTable)
      .where(eq(secretVoicerItemTable.id, id))
      .limit(1);
    return result ?? null;
  },

  getByCharacterId(characterId: string): Promise<SecretVoicerItem[]> {
    return db
      .select()
      .from(secretVoicerItemTable)
      .where(eq(secretVoicerItemTable.characterId, characterId))
      .orderBy(secretVoicerItemTable.orderIndex);
  },

  createMany(data: NewSecretVoicerItem[]): Promise<SecretVoicerItem[]> {
    return db.insert(secretVoicerItemTable).values(data).returning();
  },

  async update(
    id: string,
    data: UpdateSecretVoicerItem,
  ): Promise<SecretVoicerItem | null> {
    const [result] = await db
      .update(secretVoicerItemTable)
      .set(data)
      .where(eq(secretVoicerItemTable.id, id))
      .returning();
    return result ?? null;
  },

  async updateStatus(
    id: string,
    status: ItemStatus,
  ): Promise<SecretVoicerItem | null> {
    const [result] = await db
      .update(secretVoicerItemTable)
      .set({ status })
      .where(eq(secretVoicerItemTable.id, id))
      .returning();
    return result ?? null;
  },

  updateManyStatus(
    ids: string[],
    status: ItemStatus,
  ): Promise<SecretVoicerItem[]> {
    return db
      .update(secretVoicerItemTable)
      .set({ status })
      .where(inArray(secretVoicerItemTable.id, ids))
      .returning();
  },

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(secretVoicerItemTable)
      .where(eq(secretVoicerItemTable.id, id))
      .returning({ id: secretVoicerItemTable.id });
    return result.length > 0;
  },

  async reorderAfterDelete(
    projectId: string,
    deletedOrderIndex: number,
  ): Promise<void> {
    const items = await db
      .select()
      .from(secretVoicerItemTable)
      .where(eq(secretVoicerItemTable.projectId, projectId))
      .orderBy(secretVoicerItemTable.orderIndex);

    const updates = items
      .filter((item) => item.orderIndex > deletedOrderIndex)
      .map((item) =>
        db
          .update(secretVoicerItemTable)
          .set({ orderIndex: item.orderIndex - 1 })
          .where(eq(secretVoicerItemTable.id, item.id)),
      );

    await Promise.all(updates);
  },

  async countByProjectAndStatus(
    projectId: string,
  ): Promise<Record<ItemStatus, number>> {
    const items = await db
      .select({ status: secretVoicerItemTable.status })
      .from(secretVoicerItemTable)
      .where(eq(secretVoicerItemTable.projectId, projectId));

    const counts: Record<ItemStatus, number> = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      comparing: 0,
    };

    for (const item of items) {
      counts[item.status as ItemStatus]++;
    }

    return counts;
  },
};
