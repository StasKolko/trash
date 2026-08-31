import type {
  NewSecretVoicerCharacter,
  SecretVoicerCharacter,
  UpdateSecretVoicerCharacter,
} from "./types";

import { and, eq } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { secretVoicerCharacterTable } from "./table";

export const secretVoicerCharacterRepository = {
  getByProjectId(projectId: string): Promise<SecretVoicerCharacter[]> {
    return db
      .select()
      .from(secretVoicerCharacterTable)
      .where(eq(secretVoicerCharacterTable.projectId, projectId));
  },

  async getById(id: string): Promise<SecretVoicerCharacter | null> {
    const [result] = await db
      .select()
      .from(secretVoicerCharacterTable)
      .where(eq(secretVoicerCharacterTable.id, id))
      .limit(1);
    return result ?? null;
  },

  async getByProjectAndName(
    projectId: string,
    name: string,
  ): Promise<SecretVoicerCharacter | null> {
    const [result] = await db
      .select()
      .from(secretVoicerCharacterTable)
      .where(
        and(
          eq(secretVoicerCharacterTable.projectId, projectId),
          eq(secretVoicerCharacterTable.name, name),
        ),
      )
      .limit(1);
    return result ?? null;
  },

  createMany(
    data: NewSecretVoicerCharacter[],
  ): Promise<SecretVoicerCharacter[]> {
    return db.insert(secretVoicerCharacterTable).values(data).returning();
  },

  async update(
    id: string,
    data: UpdateSecretVoicerCharacter,
  ): Promise<SecretVoicerCharacter | null> {
    const [result] = await db
      .update(secretVoicerCharacterTable)
      .set(data)
      .where(eq(secretVoicerCharacterTable.id, id))
      .returning();
    return result ?? null;
  },
};
