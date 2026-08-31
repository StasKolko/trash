import { and, eq, lt, sql } from "drizzle-orm";
import { db } from "#api/shared/db";
import { processedAudioTable } from "./table";
import type {
  NewProcessedAudio,
  ProcessedAudio,
  UpdateProcessedAudio,
} from "./types";

export async function createProcessedAudio(
  data: NewProcessedAudio,
): Promise<ProcessedAudio> {
  const [result] = await db
    .insert(processedAudioTable)
    .values(data)
    .returning();
  if (!result) {
    throw new Error("Failed to create processed audio record");
  }
  return result;
}

export function getProcessedAudioById(
  id: string,
): Promise<ProcessedAudio | undefined> {
  return db.query.processedAudioTable.findFirst({
    where: eq(processedAudioTable.id, id),
  });
}

export function getProcessedAudioBySourceProject(
  projectId: string,
): Promise<ProcessedAudio | undefined> {
  return db.query.processedAudioTable.findFirst({
    where: and(
      eq(processedAudioTable.sourceType, "synthesis"),
      eq(processedAudioTable.sourceProjectId, projectId),
    ),
  });
}

export function getAllCachedAudio(): Promise<ProcessedAudio[]> {
  return db
    .select()
    .from(processedAudioTable)
    .orderBy(sql`${processedAudioTable.createdAt} DESC`);
}

export function getValidCachedAudio(): Promise<ProcessedAudio[]> {
  return db
    .select()
    .from(processedAudioTable)
    .where(
      and(
        eq(processedAudioTable.status, "COMPLETED"),
        sql`${processedAudioTable.expiresAt} > NOW()`,
      ),
    )
    .orderBy(sql`${processedAudioTable.createdAt} DESC`);
}

export async function updateProcessedAudio(
  id: string,
  data: UpdateProcessedAudio,
): Promise<ProcessedAudio | undefined> {
  const [result] = await db
    .update(processedAudioTable)
    .set(data)
    .where(eq(processedAudioTable.id, id))
    .returning();
  return result;
}

export async function deleteProcessedAudio(
  id: string,
): Promise<ProcessedAudio | undefined> {
  const [result] = await db
    .delete(processedAudioTable)
    .where(eq(processedAudioTable.id, id))
    .returning();
  return result;
}

export async function deleteExpiredCache(): Promise<number> {
  const result = await db
    .delete(processedAudioTable)
    .where(lt(processedAudioTable.expiresAt, new Date()))
    .returning();
  return result.length;
}

export async function deleteAllCache(): Promise<number> {
  const result = await db.delete(processedAudioTable).returning();
  return result.length;
}
