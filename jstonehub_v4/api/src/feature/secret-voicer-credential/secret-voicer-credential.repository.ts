import type {
  CredentialError,
  SecretVoicerCredential,
  SecretVoicerCredentialWithFingerprint,
} from "./secret-voicer-credential.type";

import { eq } from "drizzle-orm";

import { browserFingerprintsTable } from "#api/feature/browser-fingerprint/browser-fingerprint.table";
import { db } from "#api/shared/db/instance";

import { secretVoicerCredentialsTable } from "./secret-voicer-credential.table";

const SELECT_WITH_FINGERPRINT = {
  id: secretVoicerCredentialsTable.id,
  fingerprintId: secretVoicerCredentialsTable.fingerprintId,
  csrfToken: secretVoicerCredentialsTable.csrfToken,
  sessionId: secretVoicerCredentialsTable.sessionId,
  isActive: secretVoicerCredentialsTable.isActive,
  lastError: secretVoicerCredentialsTable.lastError,
  lastErrorAt: secretVoicerCredentialsTable.lastErrorAt,
  createdAt: secretVoicerCredentialsTable.createdAt,
  updatedAt: secretVoicerCredentialsTable.updatedAt,
  fingerprintLabel: browserFingerprintsTable.label,
};

const secretVoicerCredentialRepository = {
  getAll(): Promise<SecretVoicerCredentialWithFingerprint[]> {
    return db
      .select(SELECT_WITH_FINGERPRINT)
      .from(secretVoicerCredentialsTable)
      .innerJoin(
        browserFingerprintsTable,
        eq(
          secretVoicerCredentialsTable.fingerprintId,
          browserFingerprintsTable.id,
        ),
      )
      .orderBy(secretVoicerCredentialsTable.createdAt);
  },

  getAllActive(): Promise<SecretVoicerCredentialWithFingerprint[]> {
    return db
      .select(SELECT_WITH_FINGERPRINT)
      .from(secretVoicerCredentialsTable)
      .innerJoin(
        browserFingerprintsTable,
        eq(
          secretVoicerCredentialsTable.fingerprintId,
          browserFingerprintsTable.id,
        ),
      )
      .where(eq(secretVoicerCredentialsTable.isActive, true))
      .orderBy(secretVoicerCredentialsTable.createdAt);
  },

  async getById(
    id: string,
  ): Promise<SecretVoicerCredentialWithFingerprint | null> {
    const rows = await db
      .select(SELECT_WITH_FINGERPRINT)
      .from(secretVoicerCredentialsTable)
      .innerJoin(
        browserFingerprintsTable,
        eq(
          secretVoicerCredentialsTable.fingerprintId,
          browserFingerprintsTable.id,
        ),
      )
      .where(eq(secretVoicerCredentialsTable.id, id))
      .limit(1);

    return rows[0] ?? null;
  },

  async create(data: {
    fingerprintId: string;
    csrfToken: string;
    sessionId: string;
  }): Promise<SecretVoicerCredential> {
    const rows = await db
      .insert(secretVoicerCredentialsTable)
      .values(data)
      .returning();

    const created = rows[0];
    if (!created) {
      throw new Error("Failed to create secret voicer credential");
    }
    return created;
  },

  async update(
    id: string,
    data: Partial<{
      csrfToken: string;
      sessionId: string;
      isActive: boolean;
    }>,
  ): Promise<SecretVoicerCredential | null> {
    const rows = await db
      .update(secretVoicerCredentialsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(secretVoicerCredentialsTable.id, id))
      .returning();

    return rows[0] ?? null;
  },

  async markAsError(
    id: string,
    error: CredentialError,
  ): Promise<SecretVoicerCredential | null> {
    const rows = await db
      .update(secretVoicerCredentialsTable)
      .set({
        isActive: false,
        lastError: error,
        lastErrorAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(secretVoicerCredentialsTable.id, id))
      .returning();

    return rows[0] ?? null;
  },

  async clearError(id: string): Promise<SecretVoicerCredential | null> {
    const rows = await db
      .update(secretVoicerCredentialsTable)
      .set({
        isActive: true,
        lastError: null,
        lastErrorAt: null,
        updatedAt: new Date(),
      })
      .where(eq(secretVoicerCredentialsTable.id, id))
      .returning();

    return rows[0] ?? null;
  },

  async delete(id: string): Promise<SecretVoicerCredential | null> {
    const rows = await db
      .delete(secretVoicerCredentialsTable)
      .where(eq(secretVoicerCredentialsTable.id, id))
      .returning();

    return rows[0] ?? null;
  },
};

export { secretVoicerCredentialRepository };
