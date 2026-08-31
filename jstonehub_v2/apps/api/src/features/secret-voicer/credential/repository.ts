import { eq } from "drizzle-orm";
import { db } from "#api/shared/db";
import { secretVoicerCredentialTable } from "./table";
import type {
  NewSecretVoicerCredential,
  UpdateSecretVoicerCredential,
} from "./types";

export const createSecretVoicerCredential = async (
  data: NewSecretVoicerCredential,
) => {
  const [result] = await db
    .insert(secretVoicerCredentialTable)
    .values(data)
    .returning();
  return result;
};

export const getAllSecretVoicerCredentials = async () =>
  db.select().from(secretVoicerCredentialTable);

export const getSecretVoicerCredentialById = async (id: string) =>
  db.query.secretVoicerCredentialTable.findFirst({
    where: eq(secretVoicerCredentialTable.id, id),
  });

export const getSecretVoicerCredentialsByFingerprintId = async (
  fingerprintId: string,
) =>
  db
    .select()
    .from(secretVoicerCredentialTable)
    .where(eq(secretVoicerCredentialTable.fingerprintId, fingerprintId));

export const updateSecretVoicerCredential = async (
  id: string,
  data: UpdateSecretVoicerCredential,
) => {
  const [result] = await db
    .update(secretVoicerCredentialTable)
    .set(data)
    .where(eq(secretVoicerCredentialTable.id, id))
    .returning();
  return result;
};

export const deleteSecretVoicerCredential = async (id: string) => {
  const [result] = await db
    .delete(secretVoicerCredentialTable)
    .where(eq(secretVoicerCredentialTable.id, id))
    .returning();
  return result;
};
