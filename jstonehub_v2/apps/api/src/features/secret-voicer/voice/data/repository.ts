import { eq, inArray, lt, notInArray } from "drizzle-orm";
import { db } from "#api/shared/db";
import {
  secretVoicerVoiceSyncEventTable,
  secretVoicerVoiceSyncStateTable,
  secretVoicerVoiceTable,
} from "./table";
import type {
  NewSecretVoicerVoice,
  NewSecretVoicerVoiceSyncEvent,
  SecretVoicerVoice,
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
  UpdateSecretVoicerVoice,
} from "./types";

// === Constants ===

const SYNC_STATE_ID = "main";

// === Voice Repository ===

export function getAllSecretVoicerVoices(): Promise<SecretVoicerVoice[]> {
  return db.select().from(secretVoicerVoiceTable);
}

export function getPublicSecretVoicerVoices(): Promise<SecretVoicerVoice[]> {
  return db
    .select()
    .from(secretVoicerVoiceTable)
    .where(eq(secretVoicerVoiceTable.isHidden, false));
}

export function getSecretVoicerVoiceById(
  id: string,
): Promise<SecretVoicerVoice | undefined> {
  return db.query.secretVoicerVoiceTable.findFirst({
    where: eq(secretVoicerVoiceTable.id, id),
  });
}

export function getSecretVoicerVoiceByExternalVoiceId(
  externalVoiceId: string,
): Promise<SecretVoicerVoice | undefined> {
  return db.query.secretVoicerVoiceTable.findFirst({
    where: eq(secretVoicerVoiceTable.externalVoiceId, externalVoiceId),
  });
}

export function getSecretVoicerVoicesByExternalVoiceIds(
  externalVoiceIds: string[],
): Promise<SecretVoicerVoice[]> {
  if (externalVoiceIds.length === 0) {
    return Promise.resolve([]);
  }
  return db
    .select()
    .from(secretVoicerVoiceTable)
    .where(inArray(secretVoicerVoiceTable.externalVoiceId, externalVoiceIds));
}

export function getSecretVoicerVoicesNotInExternalIds(
  externalVoiceIds: string[],
): Promise<SecretVoicerVoice[]> {
  if (externalVoiceIds.length === 0) {
    return db.select().from(secretVoicerVoiceTable);
  }
  return db
    .select()
    .from(secretVoicerVoiceTable)
    .where(
      notInArray(secretVoicerVoiceTable.externalVoiceId, externalVoiceIds),
    );
}

export async function createSecretVoicerVoice(
  data: NewSecretVoicerVoice,
): Promise<SecretVoicerVoice> {
  const [result] = await db
    .insert(secretVoicerVoiceTable)
    .values(data)
    .returning();
  if (!result) {
    throw new Error("Failed to create voice");
  }
  return result;
}

export function createSecretVoicerVoices(
  data: NewSecretVoicerVoice[],
): Promise<SecretVoicerVoice[]> {
  if (data.length === 0) {
    return Promise.resolve([]);
  }
  return db.insert(secretVoicerVoiceTable).values(data).returning();
}

export async function updateSecretVoicerVoice(
  id: string,
  data: UpdateSecretVoicerVoice,
): Promise<SecretVoicerVoice | undefined> {
  const [result] = await db
    .update(secretVoicerVoiceTable)
    .set(data)
    .where(eq(secretVoicerVoiceTable.id, id))
    .returning();
  return result;
}

export async function updateSecretVoicerVoiceExternalFields(
  id: string,
  data: Partial<NewSecretVoicerVoice>,
): Promise<SecretVoicerVoice | undefined> {
  const [result] = await db
    .update(secretVoicerVoiceTable)
    .set(data)
    .where(eq(secretVoicerVoiceTable.id, id))
    .returning();
  return result;
}

export async function deleteSecretVoicerVoice(
  id: string,
): Promise<SecretVoicerVoice | undefined> {
  const [result] = await db
    .delete(secretVoicerVoiceTable)
    .where(eq(secretVoicerVoiceTable.id, id))
    .returning();
  return result;
}

// === Sync Event Repository ===

export function getAllSecretVoicerVoiceSyncEvents(): Promise<
  SecretVoicerVoiceSyncEvent[]
> {
  return db.select().from(secretVoicerVoiceSyncEventTable);
}

export async function createSecretVoicerVoiceSyncEvent(
  data: NewSecretVoicerVoiceSyncEvent,
): Promise<SecretVoicerVoiceSyncEvent> {
  const [result] = await db
    .insert(secretVoicerVoiceSyncEventTable)
    .values(data)
    .returning();
  if (!result) {
    throw new Error("Failed to create sync event");
  }
  return result;
}

export function createSecretVoicerVoiceSyncEvents(
  data: NewSecretVoicerVoiceSyncEvent[],
): Promise<SecretVoicerVoiceSyncEvent[]> {
  if (data.length === 0) {
    return Promise.resolve([]);
  }
  return db.insert(secretVoicerVoiceSyncEventTable).values(data).returning();
}

export async function deleteSecretVoicerVoiceSyncEvent(
  id: string,
): Promise<SecretVoicerVoiceSyncEvent | undefined> {
  const [result] = await db
    .delete(secretVoicerVoiceSyncEventTable)
    .where(eq(secretVoicerVoiceSyncEventTable.id, id))
    .returning();
  return result;
}

export async function deleteAllSecretVoicerVoiceSyncEvents(): Promise<number> {
  const result = await db.delete(secretVoicerVoiceSyncEventTable).returning();
  return result.length;
}

export async function deleteOldSecretVoicerVoiceSyncEvents(
  olderThan: Date,
): Promise<number> {
  const result = await db
    .delete(secretVoicerVoiceSyncEventTable)
    .where(lt(secretVoicerVoiceSyncEventTable.createdAt, olderThan))
    .returning();
  return result.length;
}

// === Sync State Repository ===

export async function getSecretVoicerVoiceSyncState(): Promise<SecretVoicerVoiceSyncState | null> {
  const result = await db.query.secretVoicerVoiceSyncStateTable.findFirst({
    where: eq(secretVoicerVoiceSyncStateTable.id, SYNC_STATE_ID),
  });
  return result ?? null;
}

export async function upsertSecretVoicerVoiceSyncState(
  data: Partial<SecretVoicerVoiceSyncState>,
): Promise<SecretVoicerVoiceSyncState> {
  const existing = await getSecretVoicerVoiceSyncState();

  if (existing) {
    const [result] = await db
      .update(secretVoicerVoiceSyncStateTable)
      .set(data)
      .where(eq(secretVoicerVoiceSyncStateTable.id, SYNC_STATE_ID))
      .returning();
    if (!result) {
      throw new Error("Failed to update sync state");
    }
    return result;
  }

  const [result] = await db
    .insert(secretVoicerVoiceSyncStateTable)
    .values({ id: SYNC_STATE_ID, ...data })
    .returning();
  if (!result) {
    throw new Error("Failed to create sync state");
  }
  return result;
}

export async function setSecretVoicerVoiceSyncBlocked(
  blocked: boolean,
  reason?: string,
): Promise<void> {
  await upsertSecretVoicerVoiceSyncState({
    isBlocked: blocked,
    blockReason: blocked ? reason : null,
    blockedAt: blocked ? new Date() : null,
  });
}
