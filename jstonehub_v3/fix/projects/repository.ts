import type {
  NewSecretVoicerProject,
  ProjectStatus,
  SecretVoicerProject,
} from "./types";

import { eq } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { secretVoicerProjectTable } from "./table";

export const secretVoicerProjectRepository = {
  getAll(): Promise<SecretVoicerProject[]> {
    return db.select().from(secretVoicerProjectTable);
  },

  async getById(id: string): Promise<SecretVoicerProject | null> {
    const [result] = await db
      .select()
      .from(secretVoicerProjectTable)
      .where(eq(secretVoicerProjectTable.id, id))
      .limit(1);
    return result ?? null;
  },

  async create(data: NewSecretVoicerProject): Promise<SecretVoicerProject> {
    const [result] = await db
      .insert(secretVoicerProjectTable)
      .values(data)
      .returning();

    if (!result) {
      throw new Error("Failed to create project");
    }

    return result;
  },

  async updateStatus(
    id: string,
    status: ProjectStatus,
    completedAt?: Date,
  ): Promise<SecretVoicerProject | null> {
    const [result] = await db
      .update(secretVoicerProjectTable)
      .set({ status, completedAt })
      .where(eq(secretVoicerProjectTable.id, id))
      .returning();
    return result ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(secretVoicerProjectTable)
      .where(eq(secretVoicerProjectTable.id, id))
      .returning({ id: secretVoicerProjectTable.id });
    return result.length > 0;
  },
};
